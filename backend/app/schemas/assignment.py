from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AssignmentCreate(BaseModel):
    asset_id: int = Field(..., description="ID of the asset being assigned")
    employee_id: int = Field(..., description="ID of the employee receiving the asset")
    condition_at_assignment: str | None = Field(
        default="Good",
        max_length=100,
        description="Physical condition when handed over"
    )
    notes: str | None = None


class AssignmentReturn(BaseModel):
    condition_at_return: str | None = Field(
        default="Good",
        max_length=100,
        description="Physical condition upon return"
    )
    notes: str | None = None


class AssignmentResponse(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    assigned_at: datetime
    returned_at: datetime | None = None
    condition_at_assignment: str | None = None
    condition_at_return: str | None = None
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)
