from sqlalchemy.orm import Session

from app.ai.emergency_intelligence import extract_blood_request

from app.ai.scoring_engine import (
    calculate_priority_score,
    get_donor_statistics,
    calculate_distance
)

from app.models.blood_request import BloodRequest
from app.models.donor import Donor
from app.models.notification import Notification

from app.matching.blood_compatibility import is_compatible



def process_emergency_request(
    message: str,
    db: Session
):

    # -------------------------
    # Step 1 : Extract using AI
    # -------------------------

    ai_result = extract_blood_request(message)


    if not ai_result["valid"]:

        return {
            "success": False,
            "error": "Missing required fields",
            "missing_fields": ai_result["missing_fields"]
        }


    data = ai_result["data"]



    # -------------------------
    # Step 2 : Create Request
    # -------------------------

    request = BloodRequest(

        patient_name=data["patient_name"],

        blood_group=data["blood_group"],

        hospital=data["hospital"],

        phone=data["phone"],

        city=data["city"],

        urgency=data["urgency"]

    )


    db.add(request)

    db.commit()

    db.refresh(request)



    # -------------------------
    # Step 3 : Find + Rank Donors
    # -------------------------

    donors = db.query(Donor).filter(

        Donor.availability == True

    ).all()



    ranked_donors = []



    for donor in donors:


        compatible = is_compatible(

            donor.blood_group,

            request.blood_group

        )


        if compatible:


            # -------------------------
            # Donor History Analysis
            # -------------------------

            stats = get_donor_statistics(

                db,

                donor.id,

                Notification

            )



            # -------------------------
            # Real Distance Calculation
            # -------------------------

            if (

                donor.latitude
                and
                donor.longitude
                and
                request.latitude
                and
                request.longitude

            ):


                distance = calculate_distance(

                    donor.latitude,

                    donor.longitude,

                    request.latitude,

                    request.longitude

                )


            else:

                # fallback if location missing

                distance = 50



            # -------------------------
            # AI Priority Score
            # -------------------------

            ai_score = calculate_priority_score(

                donor,

                request,

                distance,

                stats["accepted"],

                stats["average_response"]

            )



            ranked_donors.append({

                "donor": donor,

                "distance": distance,

                "score": ai_score

            })



    # Sort highest AI score first

    ranked_donors.sort(

        key=lambda x: x["score"]["score"],

        reverse=True

    )



    # -------------------------
    # Step 4 : Send Notifications
    # -------------------------

    notified = []



    for item in ranked_donors:


        donor = item["donor"]

        score = item["score"]

        distance = item["distance"]



        notification = Notification(

            request_id=request.id,

            donor_id=donor.id,

            message=f"Emergency {request.blood_group} blood required",

            status="SENT",

            device_token=donor.fcm_token

        )


        db.add(notification)

        db.commit()

        db.refresh(notification)



        notified.append({

            "notification_id": notification.id,

            "donor_id": donor.id,

            "name": donor.name,

            "distance_km": distance,

            "priority_score": score["score"],

            "priority_level": score["level"],

            "reasons": score["reasons"]

        })



    # -------------------------
    # Step 5 : Return Result
    # -------------------------

    return {


        "success": True,


        "request": {

            "id": request.id,

            "patient_name": request.patient_name,

            "blood_group": request.blood_group,

            "hospital": request.hospital,

            "city": request.city,

            "urgency": request.urgency

        },


        "matched_donors": len(ranked_donors),


        "notifications_sent": len(notified),


        "ranked_donors": notified

    }