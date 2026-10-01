from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float
)
from sqlalchemy import ForeignKey

from sqlalchemy.sql import func

from app.database import Base


class BloodRequest(Base):

    __tablename__ = "blood_requests"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    patient_name = Column(
        String,
        nullable=False
    )


    blood_group = Column(
        String,
        nullable=False
    )


    hospital = Column(
        String,
        nullable=False
    )


    phone = Column(
        String
    )


    city = Column(
        String
    )


    urgency = Column(
        String,
        default="NORMAL"
    )


    status = Column(
        String,
        default="ACTIVE"
    )


    hospital_latitude = Column(
        Float,
        nullable=True
    )


    hospital_longitude = Column(
        Float,
        nullable=True
    )


    latitude = Column(
        Float,
        nullable=True
    )


    longitude = Column(
        Float,
        nullable=True
    )

    hospital_id = Column(
        Integer,
        ForeignKey('hospitals.id'),
        nullable=True,
        index=True
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )