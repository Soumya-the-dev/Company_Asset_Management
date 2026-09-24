from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeBase(BaseModel):
    employee_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique employee ID / code"
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Full name of employee"
    )
    email: str = Field(
        ...,
        min_length=3,
        max_length=150,
        description="Employee work email address"
    )
    department: str | None = Field(default=None, max_length=100)
    designation: str | None = Field(default=None, max_length=100)


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    employee_code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, min_length=3, max_length=150)
    department: str | None = Field(default=None, max_length=100)
    designation: str | None = Field(default=None, max_length=100)


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
