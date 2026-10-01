from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.donor import Donor
from app.security import verify_password
from app.auth.jwt_handler import create_access_token


def login_user(email: str, password: str, db: Session):

    # Find donor by email
    donor = db.query(Donor).filter(
        Donor.email == email
    ).first()

    # Email not found
    if not donor:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        password,
        donor.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Generate JWT token
    access_token = create_access_token(
        data={
            "sub": donor.email,
            "id": donor.id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }