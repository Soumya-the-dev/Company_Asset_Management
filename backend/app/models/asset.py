from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    asset_tag: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    asset_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    manufacturer: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    model: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    serial_number: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True
    )

    purchase_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    purchase_cost: Mapped[float | None] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Available",
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    assignments = relationship(
        "Assignment",
        back_populates="asset",
        cascade="all, delete-orphan"
    )

    status_history = relationship(
        "AssetStatusHistory",
        back_populates="asset",
        cascade="all, delete-orphan"
    )

    return_requests = relationship(
        "ReturnRequest",
        back_populates="asset",
        cascade="all, delete-orphan"
    )

    service_records = relationship(
        "ServiceRecord",
        back_populates="asset",
        cascade="all, delete-orphan"
    )