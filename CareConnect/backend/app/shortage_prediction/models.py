"""
Module 4: Blood Shortage Prediction Models
Tracks shortage risk and alerts for blood inventory.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class ShortageAlert(Base):
    """
    Alert when inventory drops below safe levels for a blood group.
    Triggers based on forecast vs current stock.
    """
    __tablename__ = "shortage_alerts"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    blood_group = Column(String, nullable=False, index=True)
    
    current_stock = Column(Integer, nullable=False)
    forecasted_demand_7days = Column(Integer, nullable=False)
    risk_level = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    
    alert_status = Column(String, default="ACTIVE")  # ACTIVE, RESOLVED, IGNORED
    days_until_stockout = Column(Integer, nullable=True)
    
    recommended_stock = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class RiskAssessment(Base):
    """
    Hospital-wide risk assessment snapshot.
    Calculated from all blood groups' shortage status.
    """
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    
    overall_risk = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    critical_blood_groups = Column(String, nullable=True)  # comma-separated
    
    total_alerts = Column(Integer, default=0)
    critical_alerts = Column(Integer, default=0)
    high_alerts = Column(Integer, default=0)
    
    stock_coverage_days = Column(Float, nullable=True)  # avg days of inventory left
    
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())
