from app.schemas.asset import (
    AssetCreate,
    AssetResponse,
    AssetUpdate,
    AssetStatusHistoryResponse,
)
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentReturn,
)
from app.schemas.return_request import (
    ReturnRequestCreate,
    ReturnRequestResponse,
    ReturnRequestUpdate,
)
from app.schemas.service_record import (
    ServiceRecordCreate,
    ServiceRecordResponse,
    ServiceRecordUpdate,
)

from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
)

__all__ = [
    "AssetCreate",
    "AssetResponse",
    "AssetUpdate",
    "AssetStatusHistoryResponse",
    "EmployeeCreate",
    "EmployeeResponse",
    "EmployeeUpdate",
    "AssignmentCreate",
    "AssignmentResponse",
    "AssignmentReturn",
    "ReturnRequestCreate",
    "ReturnRequestResponse",
    "ReturnRequestUpdate",
    "ServiceRecordCreate",
    "ServiceRecordResponse",
    "ServiceRecordUpdate",
    "LoginRequest",
    "RegisterRequest",
    "AuthResponse",
]
