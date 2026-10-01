"""
Module 5: Recommendation Engine Models
Tracks recommendations for donor campaigns, inventory refills, transfers.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Recommendation(Base):
    """
    Actionable recommendation for blood management.
    Generated from demand forecasts (Module 3) and shortage analysis (Module 4).
    """
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    
    rec_type = Column(String, nullable=False)  # DONOR_CAMPAIGN, REFILL, TRANSFER, DEFER_PROCEDURES
    blood_group = Column(String, nullable=False, index=True)
    priority = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    action_by_date = Column(DateTime(timezone=True), nullable=True)  # When action should be completed
    estimated_units_needed = Column(Integer, nullable=True)
    
    status = Column(String, default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, DISMISSED
    
    impact_score = Column(Float, nullable=True)  # 0-100, how much this helps overall
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class DonorCampaign(Base):
    """
    Organized donor campaign to increase specific blood group supply.
    Tied to recommendations.
    """
    __tablename__ = "donor_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    
    campaign_name = Column(String, nullable=False)
    blood_group_target = Column(String, nullable=False)
    
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    target_units = Column(Integer, nullable=False)
    units_collected = Column(Integer, default=0)
    
    status = Column(String, default="ACTIVE")  # ACTIVE, PAUSED, COMPLETED, CANCELLED
    
    notes = Column(Text, nullable=True)

    @property
    def progress_percent(self) -> float:
        if self.target_units and self.target_units > 0:
            return round(((self.units_collected or 0) / self.target_units) * 100, 2)
        return 0.0
