from firebase_admin import messaging
from app.firebase import firebase_config


def send_push_notification(
    donor_name,
    donor_token,
    blood_group,
    hospital,
    urgency
):

    message = messaging.Message(

        notification=messaging.Notification(
            title="🚨 Emergency Blood Request",
            body=f"{blood_group} blood needed at {hospital}"
        ),

        data={
            "donor": donor_name,
            "blood_group": blood_group,
            "hospital": hospital,
            "urgency": urgency
        },

        token=donor_token
    )


    try:

        response = messaging.send(message)

        return {
            "status": "SENT",
            "message_id": response
        }


    except Exception as e:

        return {
            "status": "FAILED",
            "error": str(e)
        }