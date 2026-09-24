from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ReturnRequestCreate(BaseModel):
    asset_id: int
    employee_id: int
    assignment_id: int
    notes: str | None = None


class ReturnRequestUpdate(BaseModel):
    status: str = Field(..., description="PENDING, APPROVED, REJECTED, COMPLETED")
    notes: str | None = None


class ReturnRequestResponse(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    assignment_id: int
    requested_at: datetime
    status: str
    processed_at: datetime | None = None
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)
