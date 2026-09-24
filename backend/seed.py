"""
Database Seeder for Company Asset Management System.
Populates realistic enterprise hardware, software licenses, employees,
custody assignments, return requests, and service records.
"""

from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models.asset import Asset
from app.models.asset_status_history import AssetStatusHistory
from app.models.assignment import Assignment
from app.models.employee import Employee
from app.models.return_request import ReturnRequest
from app.models.service_record import ServiceRecord


def seed_database(db: Session = None, reset: bool = False):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Create all tables if not exist
        Base.metadata.create_all(bind=engine)

        if reset:
            print("Resetting existing database records...")
            db.query(ReturnRequest).delete()
            db.query(ServiceRecord).delete()
            db.query(Assignment).delete()
            db.query(AssetStatusHistory).delete()
            db.query(Asset).delete()
            db.query(Employee).delete()
            db.commit()

        # Check if already seeded
        existing_assets = db.query(Asset).count()
        if existing_assets >= 10:
            print(f"Database already contains {existing_assets} assets. Skipping seed.")
            return

        print("Seeding database with realistic enterprise data...")
        now = datetime.now(timezone.utc)

        # ------------------------------------------------------------------
        # 1. EMPLOYEES
        # ------------------------------------------------------------------
        employees_data = [
            {
                "employee_code": "EMP-1001",
                "name": "Rahul Kumar",
                "email": "rahul.kumar@company.com",
                "department": "Engineering",
                "designation": "Lead Backend Engineer",
            },
            {
                "employee_code": "EMP-1002",
                "name": "Priya Sharma",
                "email": "priya.sharma@company.com",
                "department": "Engineering",
                "designation": "Full Stack Engineer",
            },
            {
                "employee_code": "EMP-1003",
                "name": "Ananya Roy",
                "email": "ananya.roy@company.com",
                "department": "Product",
                "designation": "Product Manager",
            },
            {
                "employee_code": "EMP-1004",
                "name": "Vikram Mehta",
                "email": "vikram.mehta@company.com",
                "department": "Design",
                "designation": "Lead UI/UX Designer",
            },
            {
                "employee_code": "EMP-1005",
                "name": "Neha Gupta",
                "email": "neha.gupta@company.com",
                "department": "Human Resources",
                "designation": "HR Specialist",
            },
            {
                "employee_code": "EMP-1006",
                "name": "Rohan Verma",
                "email": "rohan.verma@company.com",
                "department": "Finance",
                "designation": "Senior Financial Analyst",
            },
        ]

        emp_objs = {}
        for emp_d in employees_data:
            existing = (
                db.query(Employee)
                .filter(Employee.employee_code == emp_d["employee_code"])
                .first()
            )
            if not existing:
                existing = Employee(**emp_d)
                db.add(existing)
                db.flush()
            emp_objs[emp_d["employee_code"]] = existing

        # ------------------------------------------------------------------
        # 2. ASSETS
        # ------------------------------------------------------------------
        assets_data = [
            {
                "asset_tag": "LAP-001",
                "name": 'MacBook Pro 16" (M3 Max)',
                "asset_type": "Laptop",
                "category": "IT Hardware",
                "manufacturer": "Apple",
                "model": "MacBook Pro 16",
                "serial_number": "C02G4589MD6R",
                "purchase_date": date(2025, 3, 12),
                "purchase_cost": 3499.00,
                "status": "Assigned",
                "description": "36GB Unified Memory, 1TB SSD, Space Black. High-performance dev machine.",
            },
            {
                "asset_tag": "LAP-002",
                "name": "Dell XPS 15 (9530)",
                "asset_type": "Laptop",
                "category": "IT Hardware",
                "manufacturer": "Dell",
                "model": "XPS 15 OLED",
                "serial_number": "DL9530-8842",
                "purchase_date": date(2025, 5, 20),
                "purchase_cost": 2199.00,
                "status": "Available",
                "description": "Intel i9 13th Gen, 32GB RAM, 1TB SSD, RTX 4070. Restocked in inventory.",
            },
            {
                "asset_tag": "LAP-003",
                "name": "Lenovo ThinkPad X1 Carbon Gen 11",
                "asset_type": "Laptop",
                "category": "IT Hardware",
                "manufacturer": "Lenovo",
                "model": "ThinkPad X1 Carbon",
                "serial_number": "PF-3X992K",
                "purchase_date": date(2025, 2, 10),
                "purchase_cost": 1850.00,
                "status": "Assigned",
                "description": "Ultra-light business laptop for product management travel.",
            },
            {
                "asset_tag": "LAP-004",
                "name": 'MacBook Pro 14" (M2 Pro)',
                "asset_type": "Laptop",
                "category": "IT Hardware",
                "manufacturer": "Apple",
                "model": "MacBook Pro 14",
                "serial_number": "C02H1120MD3Q",
                "purchase_date": date(2024, 8, 15),
                "purchase_cost": 1999.00,
                "status": "Return Requested",
                "description": "16GB RAM, 512GB SSD. Employee filed return request for hardware refresh.",
            },
            {
                "asset_tag": "MON-001",
                "name": 'Dell UltraSharp 32" 4K',
                "asset_type": "Monitor",
                "category": "IT Hardware",
                "manufacturer": "Dell",
                "model": "U3223QE",
                "serial_number": "CN-0K7H62-74261",
                "purchase_date": date(2025, 1, 10),
                "purchase_cost": 899.99,
                "status": "Assigned",
                "description": "IPS Black panel, 90W USB-C hub, RJ45 Ethernet.",
            },
            {
                "asset_tag": "MON-002",
                "name": 'LG UltraFine 27" 5K',
                "asset_type": "Monitor",
                "category": "IT Hardware",
                "manufacturer": "LG",
                "model": "27MD5KL-B",
                "serial_number": "LG-5K-99014",
                "purchase_date": date(2025, 4, 18),
                "purchase_cost": 1199.00,
                "status": "Available",
                "description": "5120 x 2880 resolution, Thunderbolt 3 display in main IT supply cabinet.",
            },
            {
                "asset_tag": "MOB-001",
                "name": "Apple iPhone 15 Pro",
                "asset_type": "Mobile Device",
                "category": "Mobile & Comms",
                "manufacturer": "Apple",
                "model": "A3102",
                "serial_number": "F2LZ998XMD6M",
                "purchase_date": date(2025, 9, 25),
                "purchase_cost": 999.00,
                "status": "Assigned",
                "description": "256GB Natural Titanium. Company testing device for mobile app builds.",
            },
            {
                "asset_tag": "MOB-002",
                "name": "Samsung Galaxy S24 Ultra",
                "asset_type": "Mobile Device",
                "category": "Mobile & Comms",
                "manufacturer": "Samsung",
                "model": "SM-S928B",
                "serial_number": "R5CW1098AA",
                "purchase_date": date(2025, 2, 28),
                "purchase_cost": 1299.99,
                "status": "In Repair",
                "description": "Titanium Gray, 512GB. Sent for screen diagnostic & battery check.",
            },
            {
                "asset_tag": "LIC-001",
                "name": "JetBrains All Products Pack",
                "asset_type": "Software License",
                "category": "Software & Tools",
                "manufacturer": "JetBrains",
                "model": "Annual Enterprise Subscription",
                "serial_number": "JB-ENT-2025-99882",
                "purchase_date": date(2025, 1, 1),
                "purchase_cost": 779.00,
                "status": "Assigned",
                "description": "Includes IntelliJ Ultimate, PyCharm, WebStorm, and DataGrip.",
            },
            {
                "asset_tag": "LIC-002",
                "name": "Figma Enterprise Seat",
                "asset_type": "Software License",
                "category": "Software & Tools",
                "manufacturer": "Figma",
                "model": "Design & FigJam Organization Seat",
                "serial_number": "FIG-ORG-4421-SEAT",
                "purchase_date": date(2025, 1, 15),
                "purchase_cost": 900.00,
                "status": "Assigned",
                "description": "Dedicated design seat with shared company design system libraries.",
            },
            {
                "asset_tag": "LIC-003",
                "name": "AWS Cloud Engineering Sandbox",
                "asset_type": "Software License",
                "category": "Software & Tools",
                "manufacturer": "Amazon Web Services",
                "model": "Dev IAM Tier",
                "serial_number": "AWS-SANDBOX-092",
                "purchase_date": date(2025, 3, 1),
                "purchase_cost": 1200.00,
                "status": "Available",
                "description": "Unallocated cloud sandbox pool for rapid prototyping.",
            },
            {
                "asset_tag": "PER-001",
                "name": "Logitech MX Master 3S Mouse",
                "asset_type": "Peripheral",
                "category": "IT Hardware",
                "manufacturer": "Logitech",
                "model": "MX Master 3S",
                "serial_number": "LOG-MX3S-7721",
                "purchase_date": date(2025, 6, 1),
                "purchase_cost": 99.99,
                "status": "Available",
                "description": "Quiet click ergonomic Bluetooth mouse in inventory storage.",
            },
        ]

        asset_objs = {}
        for ast_d in assets_data:
            existing = (
                db.query(Asset)
                .filter(Asset.asset_tag == ast_d["asset_tag"])
                .first()
            )
            if not existing:
                existing = Asset(**ast_d)
                db.add(existing)
                db.flush()
                # Status history log
                hist = AssetStatusHistory(
                    asset_id=existing.id,
                    old_status="New",
                    new_status=existing.status,
                    reason="Initial enterprise inventory cataloging",
                    changed_at=now - timedelta(days=60),
                )
                db.add(hist)
            asset_objs[ast_d["asset_tag"]] = existing

        # ------------------------------------------------------------------
        # 3. ASSIGNMENTS
        # ------------------------------------------------------------------
        assignments_plan = [
            ("LAP-001", "EMP-1001", "Brand New", "Primary engineer laptop.", 45),
            ("LIC-001", "EMP-1001", "Active", "IDE subscription for backend dev.", 45),
            ("LAP-003", "EMP-1003", "Brand New", "Product manager travel laptop.", 30),
            ("MON-001", "EMP-1004", "Excellent", "Design studio 4K monitor.", 40),
            ("LIC-002", "EMP-1004", "Active", "Lead UI seat.", 40),
            ("MOB-001", "EMP-1002", "Brand New", "QA test mobile.", 20),
            ("LAP-004", "EMP-1002", "Good", "Assigned before return request.", 90),
        ]

        assign_objs = {}
        for tag, emp_code, cond, notes, days_ago in assignments_plan:
            ast = asset_objs.get(tag)
            emp = emp_objs.get(emp_code)
            if ast and emp:
                existing_assign = (
                    db.query(Assignment)
                    .filter(
                        Assignment.asset_id == ast.id,
                        Assignment.employee_id == emp.id,
                        Assignment.returned_at.is_(None),
                    )
                    .first()
                )
                if not existing_assign:
                    existing_assign = Assignment(
                        asset_id=ast.id,
                        employee_id=emp.id,
                        assigned_at=now - timedelta(days=days_ago),
                        condition_at_assignment=cond,
                        notes=notes,
                    )
                    db.add(existing_assign)
                    db.flush()
                assign_objs[f"{tag}_{emp_code}"] = existing_assign

        # ------------------------------------------------------------------
        # 4. RETURN REQUESTS
        # ------------------------------------------------------------------
        # Return request for LAP-004
        lap004 = asset_objs.get("LAP-004")
        priya = emp_objs.get("EMP-1002")
        assign_lap4 = assign_objs.get("LAP-004_EMP-1002")
        if lap004 and priya and assign_lap4:
            existing_req = (
                db.query(ReturnRequest)
                .filter(ReturnRequest.asset_id == lap004.id)
                .first()
            )
            if not existing_req:
                ret_req = ReturnRequest(
                    asset_id=lap004.id,
                    employee_id=priya.id,
                    assignment_id=assign_lap4.id,
                    status="PENDING",
                    requested_at=now - timedelta(days=2),
                    notes="Upgrading to new M3 development machine. Ready for IT return inspection.",
                )
                db.add(ret_req)

        # ------------------------------------------------------------------
        # 5. SERVICE RECORDS
        # ------------------------------------------------------------------
        s24 = asset_objs.get("MOB-002")
        if s24:
            existing_svc = (
                db.query(ServiceRecord)
                .filter(ServiceRecord.asset_id == s24.id)
                .first()
            )
            if not existing_svc:
                svc = ServiceRecord(
                    asset_id=s24.id,
                    service_type="Battery Replacement",
                    status="OPEN",
                    description="Battery health dropped below 75%; vendor replacement under enterprise warranty.",
                    cost=120.00,
                    service_provider="Samsung Care+ Enterprise",
                    service_date=(now - timedelta(days=3)).date(),
                )
                db.add(svc)

        # Completed past service for LAP-002
        lap2 = asset_objs.get("LAP-002")
        if lap2:
            existing_svc2 = (
                db.query(ServiceRecord)
                .filter(
                    ServiceRecord.asset_id == lap2.id,
                    ServiceRecord.status == "COMPLETED",
                )
                .first()
            )
            if not existing_svc2:
                svc2 = ServiceRecord(
                    asset_id=lap2.id,
                    service_type="Maintenance",
                    status="COMPLETED",
                    description="Thermal paste re-application and internal fan cleaning.",
                    cost=75.00,
                    service_provider="Dell ProSupport Direct",
                    service_date=(now - timedelta(days=40)).date(),
                    completed_date=(now - timedelta(days=35)).date(),
                )
                db.add(svc2)

        db.commit()
        print("Database seeded successfully with enterprise records!")
    except Exception as exc:
        db.rollback()
        print(f"Error seeding database: {exc}")
        raise
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_database(reset=True)
