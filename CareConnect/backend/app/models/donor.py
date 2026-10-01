from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime
)
from sqlalchemy.sql import func

from app.database import Base


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    age = Column(Integer)

    gender = Column(String)

    blood_group = Column(String)

    phone = Column(String, unique=True)

    email = Column(String, unique=True)

    fcm_token = Column(String, nullable=True)

    password = Column(String)

    city = Column(String)

    district = Column(String)

    state = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    weight = Column(Float)

    medical_conditions = Column(String)

    last_donation_date = Column(Date)

    availability = Column(Boolean, default=True)

    emergency_contact = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())