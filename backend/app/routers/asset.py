from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.asset_status_history import AssetStatusHistory
from app.schemas.asset import (
    AssetCreate,
    AssetResponse,
    AssetStatusHistoryResponse,
    AssetUpdate,
)

router = APIRouter(
    prefix="/api/assets",
    tags=["Assets"],
)

ASSET_COLUMNS = {
    "asset_tag",
    "name",
    "asset_type",
    "category",
    "manufacturer",
    "model",
    "serial_number",
    "purchase_date",
    "purchase_cost",
    "status",
    "description",
}


@router.post(
    "",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
):
    dump = asset_data.model_dump()

    # Map specifications to description if description not explicitly set
    if dump.get("specifications") and not dump.get("description"):
        dump["description"] = dump["specifications"]

    # Filter out any non-column keys
    model_kwargs = {k: v for k, v in dump.items() if k in ASSET_COLUMNS}

    asset = Asset(**model_kwargs)
    db.add(asset)

    try:
        db.commit()
        db.refresh(asset)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Asset tag or serial number already exists.",
        ) from exc

    # Log initial status in status history
    try:
        history_entry = AssetStatusHistory(
            asset_id=asset.id,
            old_status="None",
            new_status=asset.status,
            reason="Initial registration",
        )
        db.add(history_entry)
        db.commit()
    except Exception:
        db.rollback()

    return asset


@router.get(
    "",
    response_model=list[AssetResponse],
)
def get_assets(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name, tag, model, serial"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(Asset)

    if status_filter:
        query = query.filter(Asset.status.ilike(status_filter))
    if asset_type:
        query = query.filter(Asset.asset_type.ilike(asset_type))
    if category:
        query = query.filter(Asset.category.ilike(category))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Asset.name.ilike(search_pattern),
                Asset.asset_tag.ilike(search_pattern),
                Asset.serial_number.ilike(search_pattern),
                Asset.model.ilike(search_pattern),
                Asset.manufacturer.ilike(search_pattern),
            )
        )

    return (
        query.order_by(Asset.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found.",
        )

    return asset


@router.get(
    "/{asset_id}/history",
    response_model=list[AssetStatusHistoryResponse],
)
def get_asset_history(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found.",
        )

    return (
        db.query(AssetStatusHistory)
        .filter(AssetStatusHistory.asset_id == asset_id)
        .order_by(AssetStatusHistory.changed_at.desc())
        .all()
    )


@router.put(
    "/{asset_id}",
    response_model=AssetResponse,
)
def update_asset(
    asset_id: int,
    asset_data: AssetUpdate,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found.",
        )

    update_data = asset_data.model_dump(exclude_unset=True)

    # Map specifications to description
    if "specifications" in update_data and "description" not in update_data:
        update_data["description"] = update_data.pop("specifications")

    old_status = asset.status
    new_status = update_data.get("status")

    for field, value in update_data.items():
        if field in ASSET_COLUMNS:
            setattr(asset, field, value)

    asset.updated_at = datetime.now(timezone.utc)

    # Log status change in history if status was modified
    if new_status and new_status != old_status:
        history = AssetStatusHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status=new_status,
            reason="Status updated",
        )
        db.add(history)

    try:
        db.commit()
        db.refresh(asset)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Asset tag or serial number already exists.",
        ) from exc

    return asset


@router.delete(
    "/{asset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found.",
        )

    db.delete(asset)
    db.commit()

    return None