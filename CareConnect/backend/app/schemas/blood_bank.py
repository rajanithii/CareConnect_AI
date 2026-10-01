from datetime import date, datetime
from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# Enums-as-literals kept as plain strings (not pydantic Enum) to match
# the existing codebase, where status fields are plain strings with
# a default (see BloodRequest.status, Notification.status).
# ------------------------------------------------------------------

VALID_BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
VALID_COMPONENT_TYPES = {"WHOLE_BLOOD", "PLASMA", "PLATELETS", "RBC", "CRYOPRECIPITATE"}
VALID_UNIT_STATUSES = {"AVAILABLE", "RESERVED", "ISSUED", "EXPIRED", "DISCARDED", "IN_TRANSIT"}
VALID_SOURCES = {"DONATION", "TRANSFER_IN", "PURCHASE"}


# ------------------------------------------------------------------
# Storage Location
# ------------------------------------------------------------------

class StorageLocationCreate(BaseModel):
    hospital_id: int
    name: str
    location_type: str = "REFRIGERATOR"
    temperature_range: str | None = None
    capacity: int | None = None


class StorageLocationOut(BaseModel):
    id: int
    hospital_id: int
    name: str
    location_type: str
    temperature_range: str | None
    capacity: int | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------
# Blood Unit
# ------------------------------------------------------------------

class BloodUnitCreate(BaseModel):
    hospital_id: int
    donor_id: int | None = None
    blood_group: str
    component_type: str = "WHOLE_BLOOD"
    volume_ml: float | None = None
    collection_date: date | None = None
    expiry_date: date
    source: str = "DONATION"
    storage_location_id: int | None = None
    notes: str | None = None


class BloodUnitOut(BaseModel):
    id: int
    unit_code: str
    hospital_id: int
    donor_id: int | None
    blood_group: str
    component_type: str
    volume_ml: float | None
    collection_date: date | None
    expiry_date: date
    status: str
    source: str
    storage_location_id: int | None
    reserved_for_request_id: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BloodUnitReserveInput(BaseModel):
    request_id: int


class BloodUnitIssueInput(BaseModel):
    issued_to: str | None = Field(
        default=None,
        description="Free-text note on who/what the unit was issued for (e.g. patient name or request id)."
    )


class BloodUnitDiscardInput(BaseModel):
    reason: str


class BloodUnitMoveInput(BaseModel):
    storage_location_id: int


class BloodUnitLogOut(BaseModel):
    id: int
    blood_unit_id: int
    action: str
    previous_status: str | None
    new_status: str | None
    performed_by_hospital_id: int | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class InventorySummaryOut(BaseModel):
    hospital_id: int
    total_units: int
    by_status: dict[str, int]
    by_blood_group: dict[str, int]
    by_component_type: dict[str, int]
    expiring_within_7_days: int


# ------------------------------------------------------------------
# Module 2 — Blood Inventory Analytics
# ------------------------------------------------------------------

class OverviewStatOut(BaseModel):
    label: str
    value: str
    delta: str | None = None


class BloodGroupDatumOut(BaseModel):
    name: str
    value: int


class UsageTrendDatumOut(BaseModel):
    month: str
    units: int


class InventoryHeatmapOut(BaseModel):
    blood_groups: list[str]
    statuses: list[str]
    matrix: list[list[int]]
