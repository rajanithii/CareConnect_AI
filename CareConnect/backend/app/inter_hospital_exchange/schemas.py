"""
Module 6: Inter-Hospital Blood Exchange Schemas
"""

from datetime import datetime
from pydantic import BaseModel, Field


class BloodTransferRequestOut(BaseModel):
    id: int
    requesting_hospital_id: int
    supplying_hospital_id: int
    blood_group: str
    quantity_requested: int
    quantity_approved: int | None = None
    urgency: str
    status: str
    reason: str | None = None
    approval_notes: str | None = None
    requested_date: datetime
    approved_date: datetime | None = None
    completed_date: datetime | None = None

    model_config = {"from_attributes": True}


class CreateTransferRequestInput(BaseModel):
    requesting_hospital_id: int
    supplying_hospital_id: int
    blood_group: str
    quantity_requested: int = Field(ge=1, le=100)
    urgency: str = "MEDIUM"
    reason: str | None = None


class ApproveTransferInput(BaseModel):
    quantity_approved: int = Field(ge=1)
    approval_notes: str | None = None


class BloodTransferLogOut(BaseModel):
    id: int
    transfer_request_id: int
    from_hospital_id: int
    to_hospital_id: int
    blood_units_transferred: int
    blood_group: str
    shipped_date: datetime | None = None
    received_date: datetime | None = None
    carrier: str | None = None
    temperature_maintained: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CompleteTransferInput(BaseModel):
    units_transferred: int
    shipped_date: datetime | None = None
    received_date: datetime | None = None
    carrier: str | None = None
    temperature_maintained: bool | str | None = None
    condition_on_arrival: str | None = None
    notes: str | None = None


class PendingTransfersOut(BaseModel):
    hospital_id: int
    summary_date: datetime
    incoming_requests: list[BloodTransferRequestOut]  # Hospitals requesting from us
    outgoing_requests: list[BloodTransferRequestOut]  # We're requesting from others
    total_pending: int
