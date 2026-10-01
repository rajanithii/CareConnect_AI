"""
Module 8: Advanced Admin Portal Models
Hospital approvals, audit logs, system monitoring, analytics.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class HospitalApprovalRequest(Base):
    """
    Hospital registration/onboarding approval workflow.
    """
    __tablename__ = "hospital_approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True, index=True)  # Null until approved
    
    hospital_name = Column(String, nullable=False)
    hospital_email = Column(String, nullable=False)
    hospital_phone = Column(String, nullable=True)
    hospital_address = Column(String, nullable=True)
    
    request_type = Column(String, default="NEW_REGISTRATION")  # NEW_REGISTRATION, CAPACITY_UPDATE, ROLE_CHANGE
    
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    
    submitted_date = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_date = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String, nullable=True)  # Admin email who approved/rejected
    
    rejection_reason = Column(Text, nullable=True)
    approval_notes = Column(Text, nullable=True)


class AuditLog(Base):
    """
    Complete audit trail of all system actions for compliance.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True, index=True)
    user_email = Column(String, nullable=True, index=True)
    
    action = Column(String, nullable=False, index=True)  # CREATE_UNIT, DELETE_ALERT, APPROVE_TRANSFER, etc.
    entity_type = Column(String)  # BloodUnit, ShortageAlert, TransferRequest, etc.
    entity_id = Column(Integer, nullable=True)
    
    old_value = Column(JSON, nullable=True)  # Before state
    new_value = Column(JSON, nullable=True)  # After state
    
    status = Column(String, default="SUCCESS")  # SUCCESS, FAILURE
    error_message = Column(Text, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    ip_address = Column(String, nullable=True)


class SystemAlert(Base):
    """
    System-wide alerts for admins (high-level issues).
    """
    __tablename__ = "system_alerts"

    id = Column(Integer, primary_key=True, index=True)
    
    alert_type = Column(String, nullable=False)  # CRITICAL_SHORTAGE, HIGH_WASTAGE, API_ERROR, DB_ERROR
    severity = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    
    message = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    
    affected_hospitals = Column(String, nullable=True)  # Comma-separated IDs
    
    status = Column(String, default="ACTIVE")  # ACTIVE, ACKNOWLEDGED, RESOLVED
    
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class AdminDashboardSnapshot(Base):
    """
    Daily snapshot of system-wide metrics for historical tracking.
    """
    __tablename__ = "admin_dashboard_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    
    snapshot_date = Column(DateTime(timezone=True), server_default=func.now())
    
    total_hospitals = Column(Integer, default=0)
    active_hospitals = Column(Integer, default=0)
    
    total_blood_units = Column(Integer, default=0)
    units_by_status = Column(JSON)  # {AVAILABLE: 100, RESERVED: 50, ...}
    units_by_blood_group = Column(JSON)  # {O+: 150, A+: 120, ...}
    
    total_requests_today = Column(Integer, default=0)
    total_transfers_today = Column(Integer, default=0)
    total_alerts_today = Column(Integer, default=0)
    
    system_health_score = Column(Integer, default=100)  # 0-100
    
    critical_alerts = Column(Integer, default=0)
    high_alerts = Column(Integer, default=0)
