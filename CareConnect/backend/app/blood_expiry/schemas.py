"""
Module 7: Blood Expiry Management Schemas
"""

from datetime import datetime
from pydantic import BaseModel


class ExpiryAlertOut(BaseModel):
    id: int
    hospital_id: int
    blood_unit_id: int
    blood_group: str
    unit_code: str
    expiry_date: datetime
    days_until_expiry: int
    alert_level: str  # WARNING, URGENT, EXPIRED
    alert_status: str  # ACTIVE, DISMISSED, USED
    recommended_action: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}


class FIFORecommendationOut(BaseModel):
    blood_group: str
    recommended_unit_code: str
    expiry_date: datetime
    reason: str  # "Earliest expiry", "FIFO order", etc.


class ExpiryDashboardOut(BaseModel):
    hospital_id: int
    scan_date: datetime
    total_units_in_stock: int
    
    expiring_breakdown: dict  # {EXPIRED: count, URGENT: count, WARNING: count}
    
    active_alerts: list[ExpiryAlertOut]
    fifo_recommendations: list[FIFORecommendationOut]
    
    estimated_wastage_units: int
    estimated_wastage_cost: float | None = None


class ExpiryReportOut(BaseModel):
    id: int
    hospital_id: int
    report_period: str  # "2026-08"
    total_units_expired: int
    total_units_discarded: int
    total_wastage: int
    by_blood_group: str  # JSON string
    fifo_compliance_percent: int
    recommendations: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DismissAlertInput(BaseModel):
    alert_id: int | None = None
    reason: str | None = None


class GenerateExpiryReportInput(BaseModel):
    hospital_id: int
    report_period: str  # "2026-08" format
