from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.donor import Donor
from app.schemas.donor_schema import DonorCreate
from app.security import hash_password


def get_donors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Donor).offset(skip).limit(limit).all()


def get_donor(db: Session, donor_id: int):
    return db.query(Donor).filter(
        Donor.id == donor_id
    ).first()


def update_donor(db: Session, donor_id: int, payload: dict):
    donor = get_donor(db, donor_id)
    if not donor:
        return None
    for key, value in payload.items():
        if hasattr(donor, key) and key != 'id':
            if key == 'password' and value is not None:
                setattr(donor, key, hash_password(value))
            else:
                setattr(donor, key, value)
    db.commit()
    db.refresh(donor)
    return donor


def create_donor(db: Session, donor: DonorCreate):

    # Check if email already exists
    existing_email = db.query(Donor).filter(
        Donor.email == donor.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    # Check if phone number already exists
    existing_phone = db.query(Donor).filter(
        Donor.phone == donor.phone
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )


    # Convert schema data into dictionary
    # Includes fcm_token if provided
    donor_data = donor.model_dump(
        exclude_none=True
    )


    # Hash password before storing
    donor_data["password"] = hash_password(
        donor.password
    )


    # Create donor database object
    db_donor = Donor(
        **donor_data
    )


    # Save donor
    db.add(db_donor)
    db.commit()

    # Refresh to get generated ID and timestamps
    db.refresh(db_donor)


    return db_donor