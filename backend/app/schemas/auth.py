from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email, username, or Employee Code")
    password: str = Field(..., min_length=3, description="User password")
    preferred_role: Optional[str] = Field("admin", description="'admin' or 'employee'")


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=3, max_length=150, description="Work email address")
    department: str = Field("Engineering", max_length=100)
    designation: str = Field("Staff Member", max_length=100)
    employee_code: Optional[str] = Field(None, max_length=50)
    password: str = Field(..., min_length=3)


class AuthResponse(BaseModel):
    id: int
    name: str
    email: str
    employee_code: Optional[str] = None
    role: str
    department: Optional[str] = None
    designation: Optional[str] = None
    token: str

    model_config = ConfigDict(from_attributes=True)
