"""
Module 7: Blood Expiry Management Models
Tracks expiring blood units and manages FIFO usage.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base


class ExpiryAlert(Base):
    """
    Alert for blood units approaching or past expiration.
    """
    __tablename__ = "expiry_alerts"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    blood_unit_id = Column(Integer, ForeignKey("blood_units.id"), nullable=False, index=True)
    
    blood_group = Column(String, nullable=False)
    unit_code = Column(String, nullable=False)
    
    expiry_date = Column(DateTime(timezone=True), nullable=False)
    days_until_expiry = Column(Integer, nullable=False)
    alert_level = Column(String, default="WARNING")  # WARNING (7+ days), URGENT (1-7 days), EXPIRED (<0 days)
    
    alert_status = Column(String, default="ACTIVE")  # ACTIVE, DISMISSED, USED
    
    recommended_action = Column(String)  # USE_IMMEDIATELY, DEFER_PROCEDURE, DISCARD
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class FIFOUsageLog(Base):
    """
    Records FIFO (First-In-First-Out) usage recommendations and actual usage.
    Tracks which units were used and in what order.
    """
    __tablename__ = "fifo_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    blood_group = Column(String, nullable=False, index=True)
    
    recommended_unit_id = Column(Integer, ForeignKey("blood_units.id"), nullable=True)
    recommended_unit_code = Column(String, nullable=True)
    recommended_expiry = Column(DateTime(timezone=True), nullable=True)
    
    actually_used_unit_id = Column(Integer, ForeignKey("blood_units.id"), nullable=True)
    actually_used_unit_code = Column(String, nullable=True)
    
    usage_date = Column(DateTime(timezone=True), nullable=True)
    complied_with_fifo = Column(Boolean, default=False)  # Did hospital use recommended unit?
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ExpiryReport(Base):
    """
    Periodic expiry wastage report for hospital analysis.
    """
    __tablename__ = "expiry_reports"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    
    report_period = Column(String)  # "2026-08", format: YYYY-MM
    
    total_units_expired = Column(Integer, default=0)
    total_units_discarded = Column(Integer, default=0)
    total_wastage = Column(Integer, default=0)
    
    by_blood_group = Column(String)  # JSON: {O+: 5, A+: 3, ...}
    
    fifo_compliance_percent = Column(Integer, default=0)  # How many times FIFO was followed
    
    recommendations = Column(Text)  # Improvement recommendations
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
