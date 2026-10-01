from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.models.donor import Donor
from app.database import get_db
from app.security import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.services.geocoding import geocode_location


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -----------------------------
# Request schemas (JSON body)
# -----------------------------

class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    blood_group: str
    phone: str
    city: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register_donor(
    payload: RegisterInput,
    db: Session = Depends(get_db)
):

    # Check existing email
    existing_donor = db.query(Donor).filter(
        Donor.email == payload.email
    ).first()

    if existing_donor:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check existing phone number
    existing_phone = db.query(Donor).filter(
        Donor.phone == payload.phone
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    # Real geocoding via OpenStreetMap — turns the donor's city into
    # real lat/lng so the AI scoring engine's distance factor actually
    # has something to work with, instead of always falling back to
    # the hardcoded default distance.
    coords = geocode_location(payload.city)

    # Create donor object
    new_donor = Donor(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        blood_group=payload.blood_group,
        phone=payload.phone,
        city=payload.city,
        latitude=coords[0] if coords else None,
        longitude=coords[1] if coords else None,
    )

    # Save to database
    db.add(new_donor)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if 'donors_phone_key' in str(exc.orig) or 'unique constraint "donors_phone_key"' in str(exc.orig).lower():
            raise HTTPException(status_code=400, detail='Phone number already registered')
        if 'donors_email_key' in str(exc.orig) or 'unique constraint "donors_email_key"' in str(exc.orig).lower():
            raise HTTPException(status_code=400, detail='Email already registered')
        raise HTTPException(status_code=400, detail='Donor registration failed due to duplicate data')
    db.refresh(new_donor)

    # Log the donor straight in after registering, same as /login,
    # so the frontend doesn't need a second round trip.
    token = create_access_token(
        data={
            "sub": new_donor.email,
            "id": new_donor.id,
            "role": "donor"
        }
    )

    return {
        "message": "Donor registered successfully",
        "donor_id": new_donor.id,
        "geocoded": coords is not None,
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/login")
def login_user(
    payload: LoginInput,
    db: Session = Depends(get_db)
):

    donor = db.query(Donor).filter(
        Donor.email == payload.email
    ).first()

    if not donor:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        payload.password,
        donor.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        data={
            "sub": donor.email,
            "id": donor.id,
            "role": "donor"
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }