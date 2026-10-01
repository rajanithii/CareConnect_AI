from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.hospital import Hospital

router = APIRouter()


@router.get("/partners")
def get_partners(db: Session = Depends(get_db)):
    """Return a list of partner hospital names from the DB."""
    hospitals = db.query(Hospital).all()
    names = [h.name for h in hospitals]
    return names


@router.get("/testimonials")
def get_testimonials():
    """Return a small list of testimonials. This is a simple backend stub."""
    sample = [
        {
            "quote": "We found a compatible O- donor in under three minutes during a trauma case.",
            "name": "Dr. Ananya Krishnan",
            "role": "Emergency Medicine"
        },
        {
            "quote": "The donor app makes it effortless to stay available.",
            "name": "Rahul Menon",
            "role": "Regular donor"
        }
    ]
    return {"testimonials": sample}
