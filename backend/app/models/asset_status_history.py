from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AssetStatusHistory(Base):
    __tablename__ = "asset_status_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id"),
        nullable=False
    )

    old_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    new_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    changed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Relationship
    asset = relationship(
        "Asset",
        back_populates="status_history"
    )