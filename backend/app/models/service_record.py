from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ServiceRecord(Base):
    __tablename__ = "service_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id"),
        nullable=False
    )

    service_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    service_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    completed_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    cost: Mapped[float | None] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    service_provider: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="OPEN",
        nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Relationship
    asset = relationship(
        "Asset",
        back_populates="service_records"
    )