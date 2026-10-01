"""
Module 5: Recommendation Engine Schemas
"""

from datetime import datetime
from pydantic import BaseModel


class RecommendationOut(BaseModel):
    id: int
    hospital_id: int
    rec_type: str  # DONOR_CAMPAIGN, REFILL, TRANSFER, DEFER_PROCEDURES
    blood_group: str
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    title: str
    description: str
    action_by_date: datetime | None = None
    estimated_units_needed: int | None = None
    status: str  # PENDING, IN_PROGRESS, COMPLETED, DISMISSED
    impact_score: float | None = None
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class DonorCampaignOut(BaseModel):
    id: int
    hospital_id: int
    campaign_name: str
    blood_group_target: str
    start_date: datetime
    end_date: datetime | None = None
    target_units: int
    units_collected: int
    status: str  # ACTIVE, PAUSED, COMPLETED, CANCELLED
    progress_percent: float  # Calculated: units_collected / target_units * 100
    notes: str | None = None

    model_config = {"from_attributes": True}


class GenerateRecommendationsInput(BaseModel):
    hospital_id: int


class RecommendationSummaryOut(BaseModel):
    hospital_id: int
    generated_at: datetime
    total_recommendations: int
    by_priority: dict  # {CRITICAL: count, HIGH: count, ...}
    by_type: dict  # {DONOR_CAMPAIGN: count, REFILL: count, ...}
    active_recommendations: list[RecommendationOut]
    active_campaigns: list[DonorCampaignOut]


class UpdateRecommendationInput(BaseModel):
    status: str  # PENDING, IN_PROGRESS, COMPLETED, DISMISSED
    notes: str | None = None


class StartCampaignInput(BaseModel):
    blood_group: str
    campaign_name: str
    target_units: int
