from datetime import date
from math import radians, sin, cos, sqrt, atan2

from app.matching.blood_compatibility import is_compatible
# =====================================================
# DISTANCE CALCULATION
# =====================================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    """
    Calculate distance between two coordinates in KM
    """

    R = 6371


    lat1 = radians(lat1)
    lon1 = radians(lon1)

    lat2 = radians(lat2)
    lon2 = radians(lon2)


    dlat = lat2 - lat1
    dlon = lon2 - lon1


    a = (
        sin(dlat / 2) ** 2
        +
        cos(lat1)
        *
        cos(lat2)
        *
        sin(dlon / 2) ** 2
    )


    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )


    return round(
        R * c,
        2
    )

# =====================================================
# AI DONOR PRIORITY SCORE ENGINE
# =====================================================


def calculate_priority_score(
    donor,
    blood_request,
    distance=None,
    acceptance_history=0,
    avg_response_minutes=30
):
    """
    Calculates donor priority score (0-100)

    Factors:
    - Blood compatibility
    - Availability
    - Distance
    - Donation eligibility
    - Acceptance history
    - Response speed
    """

    score = 0

    reasons = []


    # ----------------------------------
    # 1. Blood Compatibility (30)
    # ----------------------------------

    if donor.blood_group == blood_request.blood_group:

        score += 30
        reasons.append(
            "Exact blood group match"
        )

    elif is_compatible(
        donor.blood_group,
        blood_request.blood_group
    ):

        score += 20
        reasons.append(
            "Compatible blood group"
        )

    else:

        score += 0
        reasons.append(
            "Blood group incompatible"
        )


    # ----------------------------------
    # 2. Availability (20)
    # ----------------------------------

    if donor.availability:

        score += 20
        reasons.append(
            "Currently available"
        )

    else:

        reasons.append(
            "Currently unavailable"
        )


    # ----------------------------------
    # 3. Distance (20)
    # ----------------------------------

    if distance is not None:


        if distance <= 5:

            score += 20
            reasons.append(
                "Very close donor"
            )


        elif distance <= 20:

            score += 15
            reasons.append(
                "Nearby donor"
            )


        elif distance <= 50:

            score += 10
            reasons.append(
                "Moderate distance"
            )


        elif distance <= 100:

            score += 5
            reasons.append(
                "Far donor"
            )


    # ----------------------------------
    # 4. Donation Eligibility (15)
    # ----------------------------------

    if donor.last_donation_date:


        days = (
            date.today()
            -
            donor.last_donation_date
        ).days


        if days >= 90:

            score += 15
            reasons.append(
                "Eligible for donation"
            )


        elif days >= 60:

            score += 8
            reasons.append(
                "Recently donated"
            )


    else:

        score += 10

        reasons.append(
            "No donation history"
        )


    # ----------------------------------
    # 5. Previous Acceptance History (10)
    # ----------------------------------

    history_score = min(
        acceptance_history * 2,
        10
    )


    score += history_score


    if acceptance_history > 0:

        reasons.append(
            "Reliable previous donor"
        )


    # ----------------------------------
    # 6. Response Speed (5)
    # ----------------------------------

    if avg_response_minutes <= 10:

        score += 5

        reasons.append(
            "Fast responder"
        )


    elif avg_response_minutes <= 20:

        score += 4


    elif avg_response_minutes <= 30:

        score += 3


    elif avg_response_minutes <= 60:

        score += 2



    final_score = min(
        score,
        100
    )


    # ----------------------------------
    # AI Recommendation Level
    # ----------------------------------

    if final_score >= 90:

        level = "Excellent"


    elif final_score >= 75:

        level = "Good"


    elif final_score >= 60:

        level = "Average"


    else:

        level = "Low"



    return {

        "score": final_score,

        "level": level,

        "reasons": reasons

    }





# =====================================================
# DONOR HISTORY ANALYSIS
# =====================================================


def get_donor_statistics(
    db,
    donor_id,
    Notification
):
    """
    Calculates donor behaviour from previous notifications.
    """


    notifications = db.query(
        Notification
    ).filter(
        Notification.donor_id == donor_id
    ).all()



    total_requests = len(
        notifications
    )


    accepted = 0


    response_times = []



    for notification in notifications:


        if notification.status == "ACCEPTED":


            accepted += 1



            if (
                notification.response_time
                and
                notification.created_at
            ):


                minutes = (

                    notification.response_time

                    -
                    notification.created_at

                ).total_seconds() / 60



                response_times.append(
                    minutes
                )



    average_response = 30



    if response_times:


        average_response = (

            sum(response_times)

            /
            len(response_times)

        )



    return {


        "total_requests": total_requests,


        "accepted": accepted,


        "average_response": round(
            average_response,
            2
        )

    }