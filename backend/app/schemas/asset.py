from datetime import date, datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


VALID_STATUSES = {
    "available": "Available",
    "assigned": "Assigned",
    "in repair": "In Repair",
    "in_repair": "In Repair",
    "return requested": "Return Requested",
    "return_requested": "Return Requested",
    "retired": "Retired",
}


def normalize_status(val: Any) -> str:
    if not isinstance(val, str):
        return "Available"
    normalized = VALID_STATUSES.get(val.strip().lower())
    if not normalized:
        raise ValueError(
            f"Invalid status '{val}'. Valid statuses: Available, Assigned, In Repair, Return Requested, Retired"
        )
    return normalized


class AssetBase(BaseModel):
    asset_tag: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique asset identifier tag"
    )

    name: str | None = Field(
        default=None,
        max_length=100,
        description="Display name of asset"
    )

    asset_type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Type/category of asset (e.g. Laptop, Monitor, Phone)"
    )

    category: str | None = Field(
        default=None,
        max_length=100,
    )

    serial_number: str | None = Field(
        default=None,
        max_length=100,
    )

    manufacturer: str | None = Field(
        default=None,
        max_length=100,
    )

    model: str | None = Field(
        default=None,
        max_length=100,
    )

    description: str | None = None
    specifications: str | None = None

    purchase_date: date | None = None
    purchase_cost: float | None = None

    status: str = Field(
        default="Available",
        description="Current asset status"
    )

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, v: Any) -> str:
        if v is None:
            return "Available"
        return normalize_status(v)

    @model_validator(mode="after")
    def sync_fields(self):
        # Sync specifications and description
        if self.description and not self.specifications:
            self.specifications = self.description
        elif self.specifications and not self.description:
            self.description = self.specifications

        # Default name if not provided
        if not self.name:
            parts = [p for p in [self.manufacturer, self.model] if p]
            if parts:
                self.name = " ".join(parts)
            else:
                self.name = f"{self.asset_type} ({self.asset_tag})"
        return self


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_tag: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, max_length=100)
    asset_type: str | None = Field(default=None, min_length=1, max_length=50)
    category: str | None = Field(default=None, max_length=100)
    serial_number: str | None = Field(default=None, max_length=100)
    manufacturer: str | None = Field(default=None, max_length=100)
    model: str | None = Field(default=None, max_length=100)
    description: str | None = None
    specifications: str | None = None
    purchase_date: date | None = None
    purchase_cost: float | None = None
    status: str | None = None

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, v: Any) -> str | None:
        if v is None:
            return None
        return normalize_status(v)

    @model_validator(mode="after")
    def sync_specs_and_desc(self):
        if self.description and not self.specifications:
            self.specifications = self.description
        elif self.specifications and not self.description:
            self.description = self.specifications
        return self


class AssetResponse(BaseModel):
    id: int
    asset_tag: str
    name: str
    asset_type: str
    category: str | None = None
    serial_number: str | None = None
    manufacturer: str | None = None
    model: str | None = None
    description: str | None = None
    specifications: str | None = None
    purchase_date: date | None = None
    purchase_cost: float | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def populate_specs(cls, data: Any) -> Any:
        if hasattr(data, "description") and not getattr(data, "specifications", None):
            desc = getattr(data, "description", None)
            if hasattr(data, "__dict__"):
                data.__dict__["specifications"] = desc
        elif isinstance(data, dict):
            if "description" in data and "specifications" not in data:
                data["specifications"] = data["description"]
            elif "specifications" in data and "description" not in data:
                data["description"] = data["specifications"]
        return data

    model_config = ConfigDict(from_attributes=True)


class AssetStatusHistoryResponse(BaseModel):
    id: int
    asset_id: int
    old_status: str
    new_status: str
    changed_at: datetime
    reason: str | None = None

    model_config = ConfigDict(from_attributes=True)