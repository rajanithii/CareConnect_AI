from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.models.hospital import Hospital

from app.database import get_db
from app.models.blood_request import BloodRequest


router = APIRouter(
    prefix="/requests",
    tags=["Blood Requests"]
)


class CreateRequestInput(BaseModel):
    patient_name: str
    blood_group: str
    hospital: str
    hospital_id: Optional[int] = None
    phone: str
    city: str
    urgency: str = "NORMAL"
    hospital_latitude: Optional[float] = None
    hospital_longitude: Optional[float] = None


@router.post("/create")
def create_blood_request(
    payload: CreateRequestInput,
    db: Session = Depends(get_db)
):

    hospital_lat = payload.hospital_latitude
    hospital_lng = payload.hospital_longitude

    # If the request is being created by a registered hospital, use the hospital's
    # stored coordinates instead of relying on the frontend to pass them explicitly.
    if payload.hospital_id:
        hosp = db.query(Hospital).filter(Hospital.id == payload.hospital_id).first()
        if hosp:
            new_request = BloodRequest(
                patient_name=payload.patient_name,
                blood_group=payload.blood_group,
                hospital=hosp.name,
                phone=payload.phone,
                city=payload.city,
                urgency=payload.urgency,
                hospital_id=hosp.id,
                hospital_latitude=hosp.latitude,
                hospital_longitude=hosp.longitude
            )
        else:
            new_request = BloodRequest(
                patient_name=payload.patient_name,
                blood_group=payload.blood_group,
                hospital=payload.hospital,
                phone=payload.phone,
                city=payload.city,
                urgency=payload.urgency,
                hospital_latitude=hospital_lat,
                hospital_longitude=hospital_lng
            )
    else:
        new_request = BloodRequest(
            patient_name=payload.patient_name,
            blood_group=payload.blood_group,
            hospital=payload.hospital,
            phone=payload.phone,
            city=payload.city,
            urgency=payload.urgency,
            hospital_latitude=hospital_lat,
            hospital_longitude=hospital_lng
        )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "message": "Blood request created successfully",
        "request_id": new_request.id,
        "status": new_request.status
    }