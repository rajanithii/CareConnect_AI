from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.models.hospital import Hospital
from app.database import get_db
from app.security import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.services.geocoding import geocode_location


router = APIRouter(
    prefix="/hospital-auth",
    tags=["Hospital Authentication"]
)


class HospitalRegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    city: str
    address: str | None = None


class HospitalLoginInput(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register_hospital(
    payload: HospitalRegisterInput,
    db: Session = Depends(get_db)
):

    existing = db.query(Hospital).filter(
        Hospital.email == payload.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Real geocoding via OpenStreetMap — turns the hospital's address
    # (or city, if no address given) into real lat/lng so donor
    # distance scoring has something accurate to work with.
    geocode_query = payload.address or payload.city
    coords = geocode_location(f"{geocode_query}")

    new_hospital = Hospital(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        phone=payload.phone,
        city=payload.city,
        address=payload.address,
        latitude=coords[0] if coords else None,
        longitude=coords[1] if coords else None,
    )

    db.add(new_hospital)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if 'hospital_email_key' in str(exc.orig) or 'unique constraint "hospital_email_key"' in str(exc.orig).lower():
            raise HTTPException(status_code=400, detail='Hospital email already registered')
        raise HTTPException(status_code=400, detail='Hospital registration failed due to duplicate data')
    db.refresh(new_hospital)

    token = create_access_token(
        data={
            "sub": new_hospital.email,
            "id": new_hospital.id,
            "role": "hospital"
        }
    )

    return {
        "message": "Hospital registered successfully",
        "hospital_id": new_hospital.id,
        "geocoded": coords is not None,
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/login")
def login_hospital(
    payload: HospitalLoginInput,
    db: Session = Depends(get_db)
):

    hospital = db.query(Hospital).filter(
        Hospital.email == payload.email
    ).first()

    if not hospital:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(payload.password, hospital.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        data={
            "sub": hospital.email,
            "id": hospital.id,
            "role": "hospital"
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/{hospital_id}")
def get_hospital(
    hospital_id: int,
    db: Session = Depends(get_db)
):

    hospital = db.query(Hospital).filter(
        Hospital.id == hospital_id
    ).first()

    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    return {
        "id": hospital.id,
        "name": hospital.name,
        "email": hospital.email,
        "phone": hospital.phone,
        "city": hospital.city,
        "address": hospital.address,
        "latitude": hospital.latitude,
        "longitude": hospital.longitude,
    }
