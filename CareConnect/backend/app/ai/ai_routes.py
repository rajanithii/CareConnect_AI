from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db

from app.ai.emergency_analyzer import analyze_emergency
from app.ai.emergency_intelligence import extract_blood_request

from app.models.blood_request import BloodRequest
from app.models.donor import Donor

from app.matching.blood_compatibility import is_compatible
from app.ai.ai_pipeline import process_emergency_request


router = APIRouter(
    prefix="/ai",
    tags=["AI Emergency Analyzer"]
)


# -----------------------------
# Request schema — used by every route below.
# Query params were replaced with a JSON body for consistency
# and so the frontend can send Content-Type: application/json
# everywhere, matching /extract-request and /process.
# -----------------------------
class RequestInput(BaseModel):
    text: str


# -----------------------------
# Rule-based quick analyzer (no LLM call — fast, deterministic)
# -----------------------------
@router.post("/analyze-request")
def analyze_request(payload: RequestInput):

    result = analyze_emergency(payload.text)

    return {
        "message": payload.text,
        "analysis": result
    }


# -----------------------------
# Rule-based analyzer + creates a BloodRequest row
# -----------------------------
@router.post("/create-request")
def create_ai_request(
    payload: RequestInput,
    db: Session = Depends(get_db)
):

    analysis = analyze_emergency(payload.text)

    blood_group = analysis["blood_group"]
    urgency = analysis["urgency"]
    city = analysis["location"]

    if not blood_group:
        return {
            "error": "Blood group not detected"
        }

    new_request = BloodRequest(
        patient_name="AI Generated Request",
        blood_group=blood_group,
        hospital="Unknown",
        phone="Not Provided",
        city=city,
        urgency=urgency
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    donors = db.query(Donor).filter(
        Donor.availability == True
    ).all()

    matched_donors = []

    for donor in donors:
        if is_compatible(donor.blood_group, blood_group):
            matched_donors.append(
                {
                    "id": donor.id,
                    "name": donor.name,
                    "blood_group": donor.blood_group,
                    "city": donor.city
                }
            )

    return {
        "message": "AI emergency request created",
        "request_id": new_request.id,
        "analysis": analysis,
        "matched_donors": matched_donors
    }


# -----------------------------
# Groq LLM natural-language extraction only (no DB write)
# -----------------------------
@router.post("/extract-request")
def extract_request(data: RequestInput):

    result = extract_blood_request(data.text)

    return {
        "status": "success",
        "extracted_data": result
    }


# -----------------------------
# Full pipeline: Groq extraction -> create request -> AI-rank
# donors -> send notifications. This is the "real" end-to-end
# flow the Create Request page should call.
# -----------------------------
@router.post("/process")
def process_request(
    data: RequestInput,
    db: Session = Depends(get_db)
):

    result = process_emergency_request(
        data.text,
        db
    )

    return result