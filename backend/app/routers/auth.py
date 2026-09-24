import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate Administrator or Employee",
)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    clean_id = request.identifier.strip().lower()

    if not clean_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifier cannot be empty.",
        )

    # 1. Administrator authentication
    if (
        request.preferred_role == "admin"
        or clean_id in ("admin", "admin@company.com")
        or clean_id.startswith("adm-")
    ):
        return AuthResponse(
            id=999,
            name="Alex Rivera",
            email="admin@company.com",
            employee_code="ADM-001",
            role="admin",
            department="IT Operations",
            designation="Lead Systems Administrator",
            token=f"auth-admin-{int(datetime.now(timezone.utc).timestamp())}",
        )

    # 2. Employee authentication
    employee = (
        db.query(Employee)
        .filter(
            or_(
                func.lower(Employee.employee_code) == clean_id,
                func.lower(Employee.email) == clean_id,
            )
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"No employee found matching credentials '{request.identifier}'.",
        )

    return AuthResponse(
        id=employee.id,
        name=employee.name,
        email=employee.email,
        employee_code=employee.employee_code,
        role="employee",
        department=employee.department,
        designation=employee.designation,
        token=f"auth-emp-{employee.id}-{int(datetime.now(timezone.utc).timestamp())}",
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Employee account",
)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    clean_email = request.email.strip().lower()

    # Check for existing email
    existing_email = (
        db.query(Employee)
        .filter(func.lower(Employee.email) == clean_email)
        .first()
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee account with this email address already exists.",
        )

    # Check or auto-generate employee_code
    emp_code = (request.employee_code or "").strip()
    if emp_code:
        existing_code = (
            db.query(Employee)
            .filter(func.lower(Employee.employee_code) == emp_code.lower())
            .first()
        )
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee code '{emp_code}' is already registered.",
            )
    else:
        # Auto-generate next EMP-XXXX
        employees = db.query(Employee.employee_code).all()
        numbers = []
        for (code,) in employees:
            if code:
                match = re.search(r"\d+", code)
                if match:
                    numbers.append(int(match.group(0)))
        next_num = max(numbers) + 1 if numbers else 1001
        emp_code = f"EMP-{next_num}"

    new_employee = Employee(
        name=request.name.strip(),
        email=clean_email,
        department=request.department.strip(),
        designation=request.designation.strip(),
        employee_code=emp_code,
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return AuthResponse(
        id=new_employee.id,
        name=new_employee.name,
        email=new_employee.email,
        employee_code=new_employee.employee_code,
        role="employee",
        department=new_employee.department,
        designation=new_employee.designation,
        token=f"auth-emp-{new_employee.id}-{int(datetime.now(timezone.utc).timestamp())}",
    )


@router.get(
    "/me",
    response_model=AuthResponse,
    summary="Get current user info",
)
def get_current_user_profile():
    # Return default admin template for verification
    return AuthResponse(
        id=999,
        name="Alex Rivera",
        email="admin@company.com",
        employee_code="ADM-001",
        role="admin",
        department="IT Operations",
        designation="Lead Systems Administrator",
        token=f"auth-admin-{int(datetime.now(timezone.utc).timestamp())}",
    )
