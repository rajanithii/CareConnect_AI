from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class BloodUnitLog(Base):
    """
    Immutable audit trail for a BloodUnit. Every state transition
    (received, reserved, issued, discarded, moved, expired...) appends
    a row here rather than overwriting history — required for
    audit-friendly, production-grade blood bank tracking.
    """

    __tablename__ = "blood_unit_logs"

    id = Column(Integer, primary_key=True, index=True)

    blood_unit_id = Column(Integer, ForeignKey("blood_units.id"), nullable=False, index=True)

    action = Column(String, nullable=False)
    # RECEIVED, RESERVED, UNRESERVED, ISSUED, DISCARDED, EXPIRED, MOVED, TRANSFERRED

    previous_status = Column(String, nullable=True)

    new_status = Column(String, nullable=True)

    performed_by_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)

    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
