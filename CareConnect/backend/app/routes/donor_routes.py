from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.donor_schema import DonorCreate, DonorRead, DonorUpdate
from app.services.donor_service import get_donors, get_donor, update_donor, create_donor
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=list[DonorRead])
def list_donors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_donors(db, skip=skip, limit=limit)


@router.get("/{donor_id}", response_model=DonorRead)
def read_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = get_donor(db, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor


@router.put("/{donor_id}", response_model=DonorRead)
def update_donor_profile(
    donor_id: int,
    donor: DonorUpdate,
    db: Session = Depends(get_db)
):
    updated = update_donor(db, donor_id, donor.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Donor not found")
    return updated


@router.post("/", response_model=DonorRead, status_code=201)
def create_new_donor(donor: DonorCreate, db: Session = Depends(get_db)):
    return create_donor(db, donor)
