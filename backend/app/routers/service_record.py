from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.asset_status_history import AssetStatusHistory
from app.models.service_record import ServiceRecord
from app.schemas.service_record import (
    ServiceRecordCreate,
    ServiceRecordResponse,
    ServiceRecordUpdate,
)

router = APIRouter(
    prefix="/api/service-records",
    tags=["Service Records"],
)


@router.post(
    "",
    response_model=ServiceRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service_record(
    record_data: ServiceRecordCreate,
    update_asset_status: bool = Query(
        True,
        description="Set asset status to 'In Repair' automatically"
    ),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.id == record_data.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found.",
        )

    record = ServiceRecord(**record_data.model_dump())
    db.add(record)

    if update_asset_status and asset.status.lower() != "in repair":
        old_status = asset.status
        asset.status = "In Repair"
        asset.updated_at = datetime.now(timezone.utc)

        history = AssetStatusHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status="In Repair",
            reason=f"Service requested: {record.service_type}",
        )
        db.add(history)

    db.commit()
    db.refresh(record)

    return record


@router.get(
    "",
    response_model=list[ServiceRecordResponse],
)
def get_service_records(
    db: Session = Depends(get_db),
    asset_id: Optional[int] = Query(None, description="Filter by asset ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (OPEN, COMPLETED, etc.)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(ServiceRecord)

    if asset_id:
        query = query.filter(ServiceRecord.asset_id == asset_id)
    if status_filter:
        query = query.filter(ServiceRecord.status.ilike(status_filter))

    return (
        query.order_by(ServiceRecord.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{record_id}",
    response_model=ServiceRecordResponse,
)
def get_service_record(
    record_id: int,
    db: Session = Depends(get_db),
):
    record = db.query(ServiceRecord).filter(ServiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service record not found.",
        )

    return record


@router.put(
    "/{record_id}",
    response_model=ServiceRecordResponse,
)
def update_service_record(
    record_id: int,
    record_data: ServiceRecordUpdate,
    return_asset_to_available: bool = Query(
        False,
        description="Set asset status back to 'Available' if completing service"
    ),
    db: Session = Depends(get_db),
):
    record = db.query(ServiceRecord).filter(ServiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service record not found.",
        )

    update_dict = record_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(record, field, value)

    if return_asset_to_available or (
        update_dict.get("status") and update_dict["status"].upper() == "COMPLETED"
    ):
        asset = db.query(Asset).filter(Asset.id == record.asset_id).first()
        if asset and asset.status.lower() == "in repair":
            old_status = asset.status
            asset.status = "Available"
            asset.updated_at = datetime.now(timezone.utc)

            history = AssetStatusHistory(
                asset_id=asset.id,
                old_status=old_status,
                new_status="Available",
                reason=f"Service completed: {record.service_type}",
            )
            db.add(history)

    db.commit()
    db.refresh(record)

    return record


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_service_record(
    record_id: int,
    db: Session = Depends(get_db),
):
    record = db.query(ServiceRecord).filter(ServiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service record not found.",
        )

    db.delete(record)
    db.commit()

    return None
