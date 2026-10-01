from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.notification import Notification
from app.models.blood_request import BloodRequest
from app.models.donor import Donor


router = APIRouter(
    prefix="/donor-dashboard",
    tags=["Donor Dashboard"]
)



@router.get("/{donor_id}/notifications")
def get_donor_notifications(
    donor_id: int,
    db: Session = Depends(get_db)
):

    # Check donor exists

    donor = db.query(
        Donor
    ).filter(
        Donor.id == donor_id
    ).first()


    if not donor:

        return {
            "error": "Donor not found"
        }



    notifications = db.query(
        Notification
    ).filter(
        Notification.donor_id == donor_id
    ).order_by(Notification.created_at.desc()).all()

    alerts = []


    for notification in notifications:


        request = db.query(
            BloodRequest
        ).filter(
            BloodRequest.id == notification.request_id
        ).first()



        if request:
            alerts.append(
                {
                    "notification_id": notification.id,
                    "request_id": request.id,
                    "blood_group": request.blood_group,
                    "hospital": request.hospital,
                    "city": request.city,
                    "urgency": request.urgency,
                    "status": notification.status,
                    "created_at": notification.created_at,
                }
            )



    return {

        "donor_id": donor_id,

        "donor_name": donor.name,

        "total_alerts": len(alerts),

        "alerts": alerts

    }