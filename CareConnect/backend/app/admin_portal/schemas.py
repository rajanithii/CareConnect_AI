"""
Module 8: Advanced Admin Portal Schemas
"""

from datetime import datetime
from pydantic import BaseModel


class HospitalApprovalRequestOut(BaseModel):
    id: int
    hospital_id: int | None
    hospital_name: str
    hospital_email: str
    hospital_phone: str | None
    hospital_address: str | None
    request_type: str
    status: str
    submitted_date: datetime
    reviewed_date: datetime | None
    reviewed_by: str | None
    rejection_reason: str | None
    approval_notes: str | None

    model_config = {"from_attributes": True}


class ApproveHospitalInput(BaseModel):
    hospital_id: int | None = None
    approval_notes: str | None = None


class RejectHospitalInput(BaseModel):
    hospital_id: int | None = None
    rejection_reason: str


class AuditLogOut(BaseModel):
    id: int
    hospital_id: int | None
    user_email: str | None
    action: str
    entity_type: str | None
    entity_id: int | None
    old_value: dict | None
    new_value: dict | None
    status: str
    error_message: str | None
    timestamp: datetime
    ip_address: str | None

    model_config = {"from_attributes": True}


class SystemAlertOut(BaseModel):
    id: int
    alert_type: str
    severity: str
    message: str
    details: str | None
    affected_hospitals: str | None
    status: str
    triggered_at: datetime
    acknowledged_at: datetime | None
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


class AdminDashboardSnapshotOut(BaseModel):
    id: int
    snapshot_date: datetime
    total_hospitals: int
    active_hospitals: int
    total_blood_units: int
    units_by_status: dict
    units_by_blood_group: dict
    total_requests_today: int
    total_transfers_today: int
    total_alerts_today: int
    system_health_score: int
    critical_alerts: int
    high_alerts: int

    model_config = {"from_attributes": True}


class AdminDashboardOut(BaseModel):
    current_snapshot: AdminDashboardSnapshotOut
    pending_approvals: list[HospitalApprovalRequestOut]
    active_system_alerts: list[SystemAlertOut]
    recent_audit_logs: list[AuditLogOut]


class AuditLogFilterInput(BaseModel):
    hospital_id: int | None = None
    action: str | None = None
    days_lookback: int = 7
