from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.blood_request import BloodRequest
from app.models.donor import Donor

from app.matching.blood_compatibility import is_compatible
from app.matching.distance import calculate_distance


router = APIRouter(
    prefix="/matching",
    tags=["AI Donor Matching"]
)



@router.get("/{request_id}")
def find_matching_donors(
    request_id: int,
    db: Session = Depends(get_db)
):

    # Get blood request

    blood_request = db.query(
        BloodRequest
    ).filter(
        BloodRequest.id == request_id
    ).first()


    if not blood_request:

        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )



    # Get available donors

    donors = db.query(
        Donor
    ).filter(
        Donor.availability == True
    ).all()



    matched_donors = []



    for donor in donors:


        # Check blood compatibility

        if is_compatible(
            donor.blood_group,
            blood_request.blood_group
        ):


            score = 50



            # Exact blood group match

            if donor.blood_group == blood_request.blood_group:
                score += 30



            # Availability bonus

            if donor.availability:
                score += 20



            distance = None



            # Location intelligence

            if (
                donor.latitude is not None
                and donor.longitude is not None
                and blood_request.hospital_latitude is not None
                and blood_request.hospital_longitude is not None
            ):


                distance = calculate_distance(

                    donor.latitude,

                    donor.longitude,

                    blood_request.hospital_latitude,

                    blood_request.hospital_longitude
                )



                # Distance based scoring

                if distance <= 10:

                    score += 20


                elif distance <= 50:

                    score += 10


                elif distance > 200:

                    score -= 10




            matched_donors.append(

                {
                    "id": donor.id,

                    "name": donor.name,

                    "blood_group": donor.blood_group,

                    "city": donor.city,

                    "phone": donor.phone,

                    "distance_km": distance,

                    "availability": donor.availability,

                    "match_score": score
                }

            )



    # Rank donors

    matched_donors.sort(

        key=lambda x: x["match_score"],

        reverse=True
    )



    return {


        "request_id": request_id,


        "required_blood_group":
        blood_request.blood_group,


        "total_matches":
        len(matched_donors),


        "recommended_donors":
        matched_donors

    }