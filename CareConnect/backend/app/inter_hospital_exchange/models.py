"""
Module 6: Inter-Hospital Blood Exchange Models
Manages blood transfers between hospitals.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class BloodTransferRequest(Base):
    """
    Request to transfer blood from one hospital to another.
    """
    __tablename__ = "blood_transfer_requests"

    id = Column(Integer, primary_key=True, index=True)
    
    requesting_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    supplying_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    
    blood_group = Column(String, nullable=False, index=True)
    quantity_requested = Column(Integer, nullable=False)
    quantity_approved = Column(Integer, nullable=True)
    
    urgency = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
    
    reason = Column(Text, nullable=True)  # Why transfer is needed
    approval_notes = Column(Text, nullable=True)  # Notes from approver
    
    requested_date = Column(DateTime(timezone=True), server_default=func.now())
    approved_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)


class BloodTransferLog(Base):
    """
    Audit log for each blood transfer completion.
    Records what was actually transferred.
    """
    __tablename__ = "blood_transfer_logs"

    id = Column(Integer, primary_key=True, index=True)
    transfer_request_id = Column(Integer, ForeignKey("blood_transfer_requests.id"), nullable=False, index=True)
    
    from_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    to_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    
    blood_units_transferred = Column(Integer, nullable=False)
    blood_group = Column(String, nullable=False)
    
    shipped_date = Column(DateTime(timezone=True), nullable=True)
    received_date = Column(DateTime(timezone=True), nullable=True)
    
    carrier = Column(String, nullable=True)  # Who transported
    temperature_maintained = Column(String, nullable=True)  # Yes/No or temp range
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
