from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.asset_status_history import AssetStatusHistory
from app.models.assignment import Assignment
from app.models.employee import Employee
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentReturn,
)

router = APIRouter(
    prefix="/api/assignments",
    tags=["Assignments"],
)


@router.post(
    "",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_assignment(
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.id == assignment_data.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found.",
        )

    employee = db.query(Employee).filter(Employee.id == assignment_data.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if asset.status.lower() != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset is currently '{asset.status}' and cannot be assigned.",
        )

    assignment = Assignment(
        asset_id=assignment_data.asset_id,
        employee_id=assignment_data.employee_id,
        condition_at_assignment=assignment_data.condition_at_assignment,
        notes=assignment_data.notes,
        assigned_at=datetime.now(timezone.utc),
    )
    db.add(assignment)

    # Update asset status
    old_status = asset.status
    asset.status = "Assigned"
    asset.updated_at = datetime.now(timezone.utc)

    # Log status history
    history = AssetStatusHistory(
        asset_id=asset.id,
        old_status=old_status,
        new_status="Assigned",
        reason=f"Assigned to {employee.name} ({employee.employee_code})",
    )
    db.add(history)

    db.commit()
    db.refresh(assignment)

    return assignment


@router.post(
    "/{assignment_id}/return",
    response_model=AssignmentResponse,
)
def return_assignment(
    assignment_id: int,
    return_data: AssignmentReturn,
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found.",
        )

    if assignment.returned_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This assignment has already been returned.",
        )

    assignment.returned_at = datetime.now(timezone.utc)
    if return_data.condition_at_return:
        assignment.condition_at_return = return_data.condition_at_return
    if return_data.notes:
        assignment.notes = (
            f"{assignment.notes or ''}\nReturn notes: {return_data.notes}".strip()
        )

    # Update asset status back to Available
    asset = db.query(Asset).filter(Asset.id == assignment.asset_id).first()
    if asset:
        old_status = asset.status
        asset.status = "Available"
        asset.updated_at = datetime.now(timezone.utc)

        history = AssetStatusHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status="Available",
            reason="Returned from assignment",
        )
        db.add(history)

    db.commit()
    db.refresh(assignment)

    return assignment


@router.get(
    "",
    response_model=list[AssignmentResponse],
)
def get_assignments(
    db: Session = Depends(get_db),
    asset_id: Optional[int] = Query(None, description="Filter by asset ID"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    active_only: bool = Query(False, description="Filter active assignments only"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(Assignment)

    if asset_id:
        query = query.filter(Assignment.asset_id == asset_id)
    if employee_id:
        query = query.filter(Assignment.employee_id == employee_id)
    if active_only:
        query = query.filter(Assignment.returned_at.is_(None))

    return (
        query.order_by(Assignment.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{assignment_id}",
    response_model=AssignmentResponse,
)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found.",
        )

    return assignment
