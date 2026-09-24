from app.routers.asset import router as asset_router
from app.routers.employee import router as employee_router
from app.routers.assignment import router as assignment_router
from app.routers.service_record import router as service_record_router
from app.routers.return_request import router as return_request_router
from app.routers.auth import router as auth_router

__all__ = [
    "asset_router",
    "employee_router",
    "assignment_router",
    "service_record_router",
    "return_request_router",
    "auth_router",
]
