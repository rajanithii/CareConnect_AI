"""
Pydantic schemas for AI Demand Forecasting API.

Request/response models for forecast endpoints.
"""

from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator


# ------------------------------------------------------------------
# Request Schemas
# ------------------------------------------------------------------

class ForecastRequestInput(BaseModel):
    hospital_id: int
    days_ahead: int = Field(default=30, ge=7, le=365, description="Number of days to forecast")
    include_recommendations: bool = Field(default=True)


class FestivalForecastInput(BaseModel):
    hospital_id: int
    events: list[dict] = Field(
        ...,
        description="List of {event_name, event_date (YYYY-MM-DD), event_type} dicts"
    )

    @field_validator("events")
    @classmethod
    def validate_events(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one event required")
        for event in v:
            if not event.get("event_name"):
                raise ValueError("Each event must have event_name")
            if not event.get("event_date"):
                raise ValueError("Each event must have event_date (YYYY-MM-DD)")
        return v


class PeakAnalysisInput(BaseModel):
    hospital_id: int
    days_lookback: int = Field(default=90, ge=30, le=730, description="Historical days to analyze")


class SeasonalAnalysisInput(BaseModel):
    hospital_id: int
    months_lookback: int = Field(default=12, ge=3, le=36, description="Historical months to analyze")


# ------------------------------------------------------------------
# Response Schemas
# ------------------------------------------------------------------

class DailyForecastOut(BaseModel):
    date: str  # YYYY-MM-DD
    predicted_units: int
    confidence: int  # 0-100
    primary_blood_groups: list[dict] | None = None  # [{blood_group, units}]
    urgency_split: dict | None = None


class WeeklyForecastOut(BaseModel):
    week_start: str  # YYYY-MM-DD
    total_predicted_units: int
    confidence: int


class DemandForecastOut(BaseModel):
    hospital_id: int
    forecast_generated_at: datetime
    forecast_period_days: int
    daily_forecasts: list[DailyForecastOut]
    weekly_summary: list[WeeklyForecastOut]
    trend: str  # "increasing" | "stable" | "decreasing"
    trend_confidence: int
    peak_days: list[str]
    seasonal_factors: list[str]
    anomalies_detected: list[str] | None = None
    recommendations: list[str]

    model_config = {"from_attributes": True}


class FestivalForecastItemOut(BaseModel):
    event_name: str
    event_date: str  # YYYY-MM-DD
    predicted_demand_increase_percent: int
    predicted_total_units: int
    confidence: int
    primary_blood_groups_needed: list[str]
    urgency_expected: str  # CRITICAL | HIGH | MEDIUM
    preparation_days_needed: int
    notes: str | None = None


class FestivalForecastOut(BaseModel):
    hospital_id: int
    generated_at: datetime
    festival_forecasts: list[FestivalForecastItemOut]
    overall_assessment: str  # "major_spike" | "moderate_increase" | "minor_increase" | "normal"

    model_config = {"from_attributes": True}


class PeakDayOut(BaseModel):
    day: str
    avg_requests: float
    avg_units: float
    rank: int


class PeakBloodGroupOut(BaseModel):
    blood_group: str
    request_frequency_percent: float
    total_units_requested: int
    rank: int


class PeakAnalysisOut(BaseModel):
    hospital_id: int
    generated_at: datetime
    peak_days_of_week: list[PeakDayOut]
    peak_blood_groups: list[PeakBloodGroupOut]
    peak_urgency_distribution: dict  # {CRITICAL, HIGH, MEDIUM, LOW: percent}
    peak_hour: str | None = None
    data_quality_score: int
    insights: list[str]

    model_config = {"from_attributes": True}


class MonthSeasonalOut(BaseModel):
    month: str
    demand_level: str  # "high" | "medium" | "low"
    avg_requests: float
    avg_units: float
    variance: float
    primary_blood_groups: list[str]
    notes: str | None = None


class SeasonalAnalysisOut(BaseModel):
    hospital_id: int
    generated_at: datetime
    months: list[MonthSeasonalOut]
    peak_season: dict  # {months: [...], reason: str, avg_units_per_day: float}
    low_season: dict  # {months: [...], avg_units_per_day: float}
    seasonal_recommendations: list[str]

    model_config = {"from_attributes": True}
