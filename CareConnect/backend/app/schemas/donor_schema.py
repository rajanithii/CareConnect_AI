from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


# Base schema (common fields)
class DonorBase(BaseModel):

    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    weight: Optional[float] = None

    medical_conditions: Optional[str] = None

    last_donation_date: Optional[date] = None

    availability: Optional[bool] = None

    emergency_contact: Optional[str] = None

    # Firebase Cloud Messaging token
    fcm_token: Optional[str] = None



# Schema used while registering a donor
class DonorCreate(DonorBase):

    password: str


# Schema used when updating donor details
class DonorUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    weight: Optional[float] = None
    medical_conditions: Optional[str] = None
    last_donation_date: Optional[date] = None
    availability: Optional[bool] = None
    emergency_contact: Optional[str] = None
    fcm_token: Optional[str] = None
    password: Optional[str] = None


# Schema returned to frontend
class DonorRead(DonorBase):

    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)