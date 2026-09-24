from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id"),
        nullable=False
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"),
        nullable=False
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    returned_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    condition_at_assignment: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    condition_at_return: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    asset = relationship(
        "Asset",
        back_populates="assignments"
    )

    employee = relationship(
        "Employee",
        back_populates="assignments"
    )

    return_requests = relationship(
        "ReturnRequest",
        back_populates="assignment",
        cascade="all, delete-orphan"
    )