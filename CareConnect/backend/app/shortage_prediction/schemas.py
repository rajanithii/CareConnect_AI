"""
Module 4: Blood Shortage Prediction Schemas
Pydantic models for API requests/responses.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class ShortageAlertOut(BaseModel):
    id: int
    hospital_id: int
    blood_group: str
    current_stock: int
    forecasted_demand_7days: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    alert_status: str  # ACTIVE, RESOLVED, IGNORED
    days_until_stockout: int | None = None
    recommended_stock: int | None = None
    notes: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}


class RiskAssessmentOut(BaseModel):
    hospital_id: int
    overall_risk: str  # LOW, MEDIUM, HIGH, CRITICAL
    critical_blood_groups: str | None = None
    total_alerts: int
    critical_alerts: int
    high_alerts: int
    stock_coverage_days: float | None = None
    assessment_date: datetime

    model_config = {"from_attributes": True}


class ShortageAnalysisInput(BaseModel):
    hospital_id: int
    days_ahead: int = Field(default=7, ge=1, le=30, description="Days to forecast shortage")


class ShortageSummaryOut(BaseModel):
    hospital_id: int
    analysis_date: datetime
    active_alerts: list[ShortageAlertOut]
    risk_assessment: RiskAssessmentOut
    recommendations: list[str]


class ResolveAlertInput(BaseModel):
    alert_id: int | None = None
    resolution_notes: str | None = None
