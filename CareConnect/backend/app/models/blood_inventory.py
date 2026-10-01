from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class BloodUnit(Base):
    """
    A single trackable blood packet/unit in a hospital's blood bank.
    This is the core entity for Smart Blood Bank Management — every
    physical unit of blood (from donation, transfer, or purchase) is
    represented by exactly one row here, tracked through its full
    lifecycle via `status` and audited via BloodUnitLog.
    """

    __tablename__ = "blood_units"

    id = Column(Integer, primary_key=True, index=True)

    # Human/scanner-facing identifier, printed as a QR/barcode label.
    # Format: BU-<hospital_id>-<short uuid>, generated in the service layer.
    unit_code = Column(String, unique=True, nullable=False, index=True)

    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)

    # Nullable — a unit may originate from a donor, or from an
    # inter-hospital transfer / external purchase (Module 6).
    donor_id = Column(Integer, ForeignKey("donors.id"), nullable=True, index=True)

    blood_group = Column(String, nullable=False, index=True)
    # A+, A-, B+, B-, AB+, AB-, O+, O-

    component_type = Column(String, default="WHOLE_BLOOD")
    # WHOLE_BLOOD, PLASMA, PLATELETS, RBC, CRYOPRECIPITATE

    volume_ml = Column(Float, nullable=True)

    collection_date = Column(Date, nullable=True)

    expiry_date = Column(Date, nullable=False, index=True)

    status = Column(String, default="AVAILABLE", index=True)
    # AVAILABLE, RESERVED, ISSUED, EXPIRED, DISCARDED, IN_TRANSIT

    source = Column(String, default="DONATION")
    # DONATION, TRANSFER_IN, PURCHASE

    storage_location_id = Column(Integer, ForeignKey("storage_locations.id"), nullable=True, index=True)

    # Set when a unit is reserved against a specific emergency request,
    # so the reservation is traceable back to the demand that caused it.
    reserved_for_request_id = Column(Integer, ForeignKey("blood_requests.id"), nullable=True, index=True)

    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
