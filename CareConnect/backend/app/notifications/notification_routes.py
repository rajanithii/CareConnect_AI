from fastapi import APIRouter, Depends, HTTPException
import json

from app.notifications.ws_manager import manager as ws_manager
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db

from app.models.notification import Notification
from app.models.blood_request import BloodRequest
from app.models.donor import Donor

from app.notifications.notification_service import send_push_notification
from app.matching.blood_compatibility import is_compatible


router = APIRouter(
    prefix="/notifications",
    tags=["Emergency Notifications"]
)



@router.get("/recent")
def recent_notifications(db: Session = Depends(get_db)):
    """Return the most recent 10 notifications."""
    notes = db.query(Notification).order_by(Notification.created_at.desc()).limit(10).all()
    result = [
        {
            "id": n.id,
            "request_id": n.request_id,
            "donor_id": n.donor_id,
            "message": n.message,
            "status": n.status,
            "created_at": n.created_at
        }
        for n in notes
    ]
    return {"recent": result}


@router.get("/history")
def notifications_history(db: Session = Depends(get_db)):
    """Return notification history (all)."""
    notes = db.query(Notification).order_by(Notification.created_at.desc()).limit(100).all()
    result = [
        {
            "id": n.id,
            "request_id": n.request_id,
            "donor_id": n.donor_id,
            "message": n.message,
            "status": n.status,
            "created_at": n.created_at
        }
        for n in notes
    ]
    return {"history": result}


@router.post("/send/{request_id}")
def send_notification(
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


    # Find available donors
    donors = db.query(
        Donor
    ).filter(
        Donor.availability == True
    ).all()


    notified_donors = []


    for donor in donors:


        # Check blood compatibility
        if is_compatible(
            donor.blood_group,
            blood_request.blood_group
        ):


            # Prevent duplicate notification
            existing = db.query(
                Notification
            ).filter(

                Notification.request_id == request_id,

                Notification.donor_id == donor.id

            ).first()


            if existing:
                continue



            notification = Notification(

                request_id=request_id,

                donor_id=donor.id,

                message=f"Emergency {blood_request.blood_group} blood required",

                status="SENT",

                device_token=donor.fcm_token

            )


            db.add(notification)

            db.commit()

            db.refresh(notification)



            # Send Firebase notification
            if donor.fcm_token:

                send_push_notification(

                    donor.name,

                    donor.fcm_token,

                    blood_request.blood_group,

                    blood_request.hospital,

                    blood_request.urgency

                )



            notified_donors.append(

                {
                    "donor_id": donor.id,

                    "name": donor.name,

                    "status": "SENT"
                }

            )


    return {

        "message": "Emergency alerts sent",

        "total_notified": len(notified_donors),

        "donors": notified_donors

    }



@router.post("/{notification_id}/accept")
async def accept_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()


    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )


    notification.status = "ACCEPTED"

    notification.response_time = datetime.now()

    # Also mark the related blood request as assigned if it's still active
    blood_request = db.query(
        BloodRequest
    ).filter(
        BloodRequest.id == notification.request_id
    ).first()

    if blood_request and blood_request.status == "ACTIVE":
        blood_request.status = "ASSIGNED"

    db.commit()

    # Broadcast update to any websocket clients watching this request
    try:
        payload = {
            "type": "notification_update",
            "request_id": notification.request_id,
            "notification_id": notification_id,
            "status": notification.status,
        }
        await ws_manager.broadcast_to_request(notification.request_id, payload)
    except Exception:
        # ignore websocket errors
        pass

    return {
        "message": "Donation accepted",
        "notification_id": notification_id,
        "status": "ACCEPTED"
    }



@router.post("/{notification_id}/reject")
async def reject_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()


    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )


    notification.status = "REJECTED"

    notification.response_time = datetime.now()

    db.commit()

    try:
        payload = {
            "type": "notification_update",
            "request_id": notification.request_id,
            "notification_id": notification_id,
            "status": notification.status,
        }
        await ws_manager.broadcast_to_request(notification.request_id, payload)
    except Exception:
        pass

    return {
        "message": "Donation rejected",
        "notification_id": notification_id,
        "status": "REJECTED"
    }


@router.post("/send_to/{request_id}/{donor_id}")
def send_notification_to_donor(
    request_id: int,
    donor_id: int,
    db: Session = Depends(get_db)
):
    """Send a single notification for a blood request to a specific donor."""

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

    # Get donor
    donor = db.query(
        Donor
    ).filter(
        Donor.id == donor_id
    ).first()

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    # Prevent duplicate notification for same request+donor
    existing = db.query(
        Notification
    ).filter(
        Notification.request_id == request_id,
        Notification.donor_id == donor_id
    ).first()

    if existing:
        return {"message": "Notification already exists", "notification_id": existing.id}

    notification = Notification(
        request_id=request_id,
        donor_id=donor_id,
        message=f"Emergency {blood_request.blood_group} blood required",
        status="SENT",
        device_token=donor.fcm_token
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Send push if token available
    if donor.fcm_token:
        send_push_notification(
            donor.name,
            donor.fcm_token,
            blood_request.blood_group,
            blood_request.hospital,
            blood_request.urgency
        )

    return {
        "message": "Notification sent to donor",
        "notification_id": notification.id,
        "donor_id": donor_id
    }