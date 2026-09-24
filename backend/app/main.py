from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import create_tables, get_db
# Import all models so SQLAlchemy metadata knows about them
from app.models import (
    Asset,
    AssetStatusHistory,
    Assignment,
    Employee,
    ReturnRequest,
    ServiceRecord,
)
from app.routers import (
    asset_router,
    assignment_router,
    auth_router,
    employee_router,
    return_request_router,
    service_record_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup if they don't exist
    create_tables()
    try:
        from seed import seed_database
        seed_database(reset=False)
    except Exception as exc:
        print(f"Startup seed notice: {exc}")
    yield


app = FastAPI(
    title="Company Asset Management System",
    description="RESTful API for tracking company assets, employee assignments, repairs, and return requests.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend integration (Vite dev server, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(employee_router)
app.include_router(assignment_router)
app.include_router(service_record_router)
app.include_router(return_request_router)


@app.get("/")
def root():
    return {
        "message": "Company Asset Management API is running",
        "docs": "/docs",
        "health": "/api/health",
        "stats": "/api/stats",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_assets = db.query(func.count(Asset.id)).scalar() or 0
    available_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status.ilike("available"))
        .scalar()
        or 0
    )
    assigned_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status.ilike("assigned"))
        .scalar()
        or 0
    )
    in_repair_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status.ilike("in repair"))
        .scalar()
        or 0
    )
    return_requested_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status.ilike("return requested"))
        .scalar()
        or 0
    )
    retired_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status.ilike("retired"))
        .scalar()
        or 0
    )
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    active_assignments = (
        db.query(func.count(Assignment.id))
        .filter(Assignment.returned_at.is_(None))
        .scalar()
        or 0
    )
    pending_returns = (
        db.query(func.count(ReturnRequest.id))
        .filter(ReturnRequest.status.ilike("pending"))
        .scalar()
        or 0
    )
    open_services = (
        db.query(func.count(ServiceRecord.id))
        .filter(ServiceRecord.status.ilike("open"))
        .scalar()
        or 0
    )

    return {
        "total_assets": total_assets,
        "available_assets": available_assets,
        "assigned_assets": assigned_assets,
        "in_repair_assets": in_repair_assets,
        "return_requested_assets": return_requested_assets,
        "retired_assets": retired_assets,
        "total_employees": total_employees,
        "active_assignments": active_assignments,
        "pending_returns": pending_returns,
        "open_services": open_services,
    }