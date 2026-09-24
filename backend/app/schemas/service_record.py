from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class ServiceRecordBase(BaseModel):
    asset_id: int
    service_type: str = Field(..., max_length=100, description="e.g. Repair, Maintenance, Inspection")
    description: str = Field(..., description="Description of the issue or service needed")
    service_date: date
    completed_date: date | None = None
    cost: float | None = None
    service_provider: str | None = Field(default=None, max_length=150)
    status: str = Field(default="OPEN", description="OPEN, IN_PROGRESS, COMPLETED, CANCELLED")
    notes: str | None = None


class ServiceRecordCreate(ServiceRecordBase):
    pass


class ServiceRecordUpdate(BaseModel):
    service_type: str | None = Field(default=None, max_length=100)
    description: str | None = None
    service_date: date | None = None
    completed_date: date | None = None
    cost: float | None = None
    service_provider: str | None = Field(default=None, max_length=150)
    status: str | None = None
    notes: str | None = None


class ServiceRecordResponse(ServiceRecordBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
