from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class StorageLocation(Base):
    """
    A physical storage location inside a hospital's blood bank —
    a fridge, freezer, or shelf that blood units are assigned to.
    Kept intentionally simple (name + type + capacity) so it can be
    extended later without a breaking migration.
    """

    __tablename__ = "storage_locations"

    id = Column(Integer, primary_key=True, index=True)

    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)

    name = Column(String, nullable=False)

    location_type = Column(String, default="REFRIGERATOR")
    # REFRIGERATOR, FREEZER, ROOM_TEMP

    temperature_range = Column(String, nullable=True)
    # e.g. "2-6°C" — informational only

    capacity = Column(Integer, nullable=True)
    # max number of units this location can hold, optional

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
