from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.asset_status_history import AssetStatusHistory
from app.models.assignment import Assignment
from app.models.employee import Employee
from app.models.return_request import ReturnRequest
from app.schemas.return_request import (
    ReturnRequestCreate,
    ReturnRequestResponse,
    ReturnRequestUpdate,
)

router = APIRouter(
    prefix="/api/return-requests",
    tags=["Return Requests"],
)


@router.post(
    "",
    response_model=ReturnRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_return_request(
    request_data: ReturnRequestCreate,
    db: Session = Depends(get_db),
):
    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == request_data.assignment_id)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found.",
        )

    if assignment.returned_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment has already been returned.",
        )

    return_req = ReturnRequest(
        asset_id=request_data.asset_id,
        employee_id=request_data.employee_id,
        assignment_id=request_data.assignment_id,
        notes=request_data.notes,
        requested_at=datetime.now(timezone.utc),
        status="PENDING",
    )
    db.add(return_req)

    # Update asset status
    asset = db.query(Asset).filter(Asset.id == request_data.asset_id).first()
    if asset:
        old_status = asset.status
        asset.status = "Return Requested"
        asset.updated_at = datetime.now(timezone.utc)

        history = AssetStatusHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status="Return Requested",
            reason="Return request submitted",
        )
        db.add(history)

    db.commit()
    db.refresh(return_req)

    return return_req


@router.get(
    "",
    response_model=list[ReturnRequestResponse],
)
def get_return_requests(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (PENDING, APPROVED, REJECTED)"),
    asset_id: Optional[int] = Query(None, description="Filter by asset ID"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(ReturnRequest)

    if status_filter:
        query = query.filter(ReturnRequest.status.ilike(status_filter))
    if asset_id:
        query = query.filter(ReturnRequest.asset_id == asset_id)
    if employee_id:
        query = query.filter(ReturnRequest.employee_id == employee_id)

    return (
        query.order_by(ReturnRequest.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{request_id}",
    response_model=ReturnRequestResponse,
)
def get_return_request(
    request_id: int,
    db: Session = Depends(get_db),
):
    req = db.query(ReturnRequest).filter(ReturnRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found.",
        )

    return req


@router.post(
    "/{request_id}/approve",
    response_model=ReturnRequestResponse,
)
def approve_return_request(
    request_id: int,
    condition_at_return: Optional[str] = Query("Good"),
    db: Session = Depends(get_db),
):
    req = db.query(ReturnRequest).filter(ReturnRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found.",
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Return request is already '{req.status}'.",
        )

    now = datetime.now(timezone.utc)
    req.status = "APPROVED"
    req.processed_at = now

    # Complete assignment
    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == req.assignment_id)
        .first()
    )
    if assignment:
        assignment.returned_at = now
        assignment.condition_at_return = condition_at_return

    # Update asset
    asset = db.query(Asset).filter(Asset.id == req.asset_id).first()
    if asset:
        old_status = asset.status
        asset.status = "Available"
        asset.updated_at = now

        history = AssetStatusHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status="Available",
            reason="Return request approved; asset returned",
        )
        db.add(history)

    db.commit()
    db.refresh(req)

    return req


@router.post(
    "/{request_id}/reject",
    response_model=ReturnRequestResponse,
)
def reject_return_request(
    request_id: int,
    reason: Optional[str] = Query(None, description="Reason for rejection"),
    db: Session = Depends(get_db),
):
    req = db.query(ReturnRequest).filter(ReturnRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found.",
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Return request is already '{req.status}'.",
        )

    now = datetime.now(timezone.utc)
    req.status = "REJECTED"
    req.processed_at = now
    if reason:
        req.notes = f"{req.notes or ''}\nRejection reason: {reason}".strip()

    # Revert asset status back to Assigned
    asset = db.query(Asset).filter(Asset.id == req.asset_id).first()
    if asset:
        old_status = asset.status
        asset.status = "Assigned"
        asset.updated_at = now

        history = AssetStatusHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status="Assigned",
            reason=f"Return request rejected: {reason or 'No reason provided'}",
        )
        db.add(history)

    db.commit()
    db.refresh(req)

    return req
