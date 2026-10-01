from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.auth_decorator import verify_hospital_token
from app.database import get_db
from app.services.geocoding import geocode_location

from app.models.blood_request import BloodRequest
from app.models.notification import Notification
from app.models.donor import Donor
from app.models.hospital import Hospital

from app.matching.distance import calculate_distance


router = APIRouter(
    prefix="/hospital",
    tags=["Hospital Dashboard"]
)


@router.get("/profile")
def get_hospital_profile(
    current_user: dict = Depends(verify_hospital_token),
    db: Session = Depends(get_db),
):
    hospital = db.query(Hospital).filter(Hospital.id == current_user.get("id")).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

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


# ============================================
# Get All Blood Requests
# ============================================

@router.get("/requests")
def get_all_requests(
    db: Session = Depends(get_db)
):

    requests = db.query(
        BloodRequest
    ).all()

    return {

        "total_requests": len(requests),

        "requests": requests

    }


# ============================================
# Get Requests That Have an Accepted Donor
# (used to populate the Live Tracking list —
# only these have a real route to draw)
#
# NOTE: this route MUST be defined before
# GET /requests/{request_id} below. FastAPI
# matches routes in definition order, and
# {request_id} is typed as int — if this came
# after, "/requests/accepted" would first try
# to match {request_id}, fail to parse "accepted"
# as an int, and 422 instead of reaching here.
# ============================================

@router.get("/requests/accepted")
def get_accepted_requests(
    db: Session = Depends(get_db)
):

    accepted_notifications = db.query(
        Notification
    ).filter(
        Notification.status == "ACCEPTED"
    ).all()

    results = []

    seen_request_ids = set()

    for notification in accepted_notifications:

        if notification.request_id in seen_request_ids:
            continue

        seen_request_ids.add(notification.request_id)

        blood_request = db.query(BloodRequest).filter(
            BloodRequest.id == notification.request_id
        ).first()

        donor = db.query(Donor).filter(
            Donor.id == notification.donor_id
        ).first()

        if not blood_request or not donor:
            continue

        results.append({
            "request_id": blood_request.id,
            "patient_name": blood_request.patient_name,
            "hospital": blood_request.hospital,
            "city": blood_request.city,
            "blood_group": blood_request.blood_group,
            "urgency": blood_request.urgency,
            "donor_name": donor.name,
        })

    return {
        "total": len(results),
        "requests": results
    }


# ============================================
# Real Tracking Data For One Request
# (hospital + accepted donor coordinates —
# the frontend fetches the real driving route
# separately via OSRM using these coordinates)
# ============================================

@router.get("/requests/{request_id}/tracking")
def get_request_tracking(
    request_id: int,
    db: Session = Depends(get_db)
):

    blood_request = db.query(BloodRequest).filter(
        BloodRequest.id == request_id
    ).first()

    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")

    accepted_notification = db.query(Notification).filter(
        Notification.request_id == request_id,
        Notification.status == "ACCEPTED"
    ).first()

    if not accepted_notification:
        raise HTTPException(
            status_code=404,
            detail="No donor has accepted this request yet"
        )

    donor = db.query(Donor).filter(
        Donor.id == accepted_notification.donor_id
    ).first()

    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    hospital_lat = blood_request.hospital_latitude
    hospital_lng = blood_request.hospital_longitude
    donor_lat = donor.latitude
    donor_lng = donor.longitude
    persisted = False

    if (not hospital_lat or not hospital_lng) and blood_request.hospital_id:
        hosp = db.query(Hospital).filter(Hospital.id == blood_request.hospital_id).first()
        if hosp and hosp.latitude is not None and hosp.longitude is not None:
            hospital_lat = hosp.latitude
            hospital_lng = hosp.longitude
            blood_request.hospital_latitude = hospital_lat
            blood_request.hospital_longitude = hospital_lng
            persisted = True

    if (not hospital_lat or not hospital_lng):
        if blood_request.hospital_id:
            hosp = db.query(Hospital).filter(Hospital.id == blood_request.hospital_id).first()
            if hosp and hosp.latitude is not None and hosp.longitude is not None:
                hospital_lat = hosp.latitude
                hospital_lng = hosp.longitude
                blood_request.hospital_latitude = hospital_lat
                blood_request.hospital_longitude = hospital_lng
                persisted = True

    if (not hospital_lat or not hospital_lng) and blood_request.hospital:
        coords = geocode_location(blood_request.hospital)
        if coords:
            hospital_lat, hospital_lng = coords
            blood_request.hospital_latitude = hospital_lat
            blood_request.hospital_longitude = hospital_lng
            persisted = True

    if (not hospital_lat or not hospital_lng) and blood_request.city:
        coords = geocode_location(f"{blood_request.city}, India")
        if coords:
            hospital_lat, hospital_lng = coords
            blood_request.hospital_latitude = hospital_lat
            blood_request.hospital_longitude = hospital_lng
            persisted = True

    if (not hospital_lat or not hospital_lng) and blood_request.hospital and blood_request.city:
        coords = geocode_location(f"{blood_request.hospital}, {blood_request.city}, India")
        if coords:
            hospital_lat, hospital_lng = coords
            blood_request.hospital_latitude = hospital_lat
            blood_request.hospital_longitude = hospital_lng
            persisted = True

    if (not donor_lat or not donor_lng) and donor.city:
        coords = geocode_location(donor.city)
        if not coords:
            coords = geocode_location(f"{donor.city}, India")
        if coords:
            donor_lat, donor_lng = coords
            donor.latitude = donor_lat
            donor.longitude = donor_lng
            persisted = True

    if persisted:
        db.commit()
        db.refresh(blood_request)
        db.refresh(donor)

    distance_km = None
    if donor_lat is not None and donor_lng is not None and hospital_lat is not None and hospital_lng is not None:
        distance_km = calculate_distance(
            donor_lat,
            donor_lng,
            hospital_lat,
            hospital_lng
        )

    return {
        "request_id": blood_request.id,
        "hospital": {
            "name": blood_request.hospital,
            "city": blood_request.city,
            "latitude": hospital_lat,
            "longitude": hospital_lng,
        },
        "donor": {
            "id": donor.id,
            "name": donor.name,
            "blood_group": donor.blood_group,
            "city": donor.city,
            "phone": donor.phone,
            "latitude": donor_lat,
            "longitude": donor_lng,
        },
        "distance_km": distance_km
    }


# ============================================
# Get Status of One Blood Request
# ============================================

@router.get("/requests/{request_id}")
def get_request_status(
    request_id: int,
    db: Session = Depends(get_db)
):

    blood_request = db.query(
        BloodRequest
    ).filter(
        BloodRequest.id == request_id
    ).first()

    if not blood_request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    notifications = db.query(
        Notification
    ).filter(
        Notification.request_id == request_id
    ).all()

    donors = []

    accepted_count = 0

    for notification in notifications:

        donor = db.query(
            Donor
        ).filter(
            Donor.id == notification.donor_id
        ).first()

        if donor:

            donors.append(
              {
                "notification_id": notification.id,
                "donor_id": donor.id,
                "name": donor.name,
                "blood_group": donor.blood_group,
                "city": donor.city,
                "phone": donor.phone,
                "status": notification.status,
                "response_time": notification.response_time
              }
             )

        if notification.status == "ACCEPTED":

            accepted_count += 1

    return {

        "request_id": blood_request.id,

        "patient_name": blood_request.patient_name,

        "blood_group": blood_request.blood_group,

        "hospital": blood_request.hospital,

        "city": blood_request.city,

        "urgency": blood_request.urgency,

        "status": blood_request.status,

        "total_notifications": len(notifications),

        "accepted_donors": accepted_count,

        "donors": donors

    }


# ============================================
# Hospital Dashboard Statistics
# ============================================

@router.get("/statistics")
def hospital_statistics(
    db: Session = Depends(get_db)
):

    total_requests = db.query(
        BloodRequest
    ).count()

    active_requests = db.query(
        BloodRequest
    ).filter(
        BloodRequest.status == "ACTIVE"
    ).count()

    completed_requests = db.query(
        BloodRequest
    ).filter(
        BloodRequest.status == "COMPLETED"
    ).count()

    cancelled_requests = db.query(
        BloodRequest
    ).filter(
        BloodRequest.status == "CANCELLED"
    ).count()

    available_donors = db.query(
        Donor
    ).filter(
        Donor.availability == True
    ).count()

    total_notifications = db.query(
        Notification
    ).count()

    accepted_notifications = db.query(
        Notification
    ).filter(
        Notification.status == "ACCEPTED"
    ).count()

    rejected_notifications = db.query(
        Notification
    ).filter(
        Notification.status == "REJECTED"
    ).count()

    pending_notifications = db.query(
        Notification
    ).filter(
        Notification.status == "SENT"
    ).count()

    return {

        "total_requests": total_requests,

        "active_requests": active_requests,

        "completed_requests": completed_requests,

        "cancelled_requests": cancelled_requests,

        "available_donors": available_donors,

        "total_notifications": total_notifications,

        "accepted_notifications": accepted_notifications,

        "rejected_notifications": rejected_notifications,

        "pending_notifications": pending_notifications

    }


# ============================================
# Mark Blood Request as Completed
# ============================================

@router.patch("/requests/{request_id}/complete")
def complete_request(
    request_id: int,
    db: Session = Depends(get_db)
):

    blood_request = db.query(
        BloodRequest
    ).filter(
        BloodRequest.id == request_id
    ).first()

    if not blood_request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    blood_request.status = "COMPLETED"

    db.commit()

    return {

        "message": "Blood request completed successfully",

        "request_id": request_id,

        "status": blood_request.status

    }


# ============================================
# Cancel Blood Request
# ============================================

@router.patch("/requests/{request_id}/cancel")
def cancel_request(
    request_id: int,
    db: Session = Depends(get_db)
):

    blood_request = db.query(
        BloodRequest
    ).filter(
        BloodRequest.id == request_id
    ).first()

    if not blood_request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    blood_request.status = "CANCELLED"

    db.commit()

    return {

        "message": "Blood request cancelled successfully",

        "request_id": request_id,

        "status": blood_request.status

    }