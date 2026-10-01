"""
Newsletter Subscription API Routes
Handles email capture for landing page newsletter
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])


# ════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ════════════════════════════════════════════════════════════════════════════

class NewsletterSignupRequest(BaseModel):
    """Newsletter signup request"""
    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None  # e.g., "Hospital Admin", "Donor", "Blood Bank"


class NewsletterSignupResponse(BaseModel):
    """Newsletter signup response"""
    message: str
    email: str
    status: str  # "pending_confirmation" or "subscribed"


# ════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@router.post("/subscribe", response_model=NewsletterSignupResponse)
async def subscribe_newsletter(data: NewsletterSignupRequest):
    """
    Subscribe email to newsletter
    
    Request Body:
    {
        "email": "user@example.com",
        "name": "John Doe",
        "company": "City Medical Center",
        "role": "Hospital Admin"
    }
    
    Response:
    {
        "message": "Successfully subscribed to newsletter!",
        "email": "user@example.com",
        "status": "pending_confirmation"
    }
    """
    try:
        # Validate email
        if not data.email or "@" not in data.email:
            raise ValueError("Invalid email format")

        # Mock data - Replace with database save when ready
        # Example:
        # subscription = NewsletterSubscription(
        #     email=data.email,
        #     name=data.name,
        #     company=data.company,
        #     role=data.role,
        #     subscribed_at=datetime.utcnow(),
        #     status="pending_confirmation"
        # )
        # db.add(subscription)
        # db.commit()

        # Send confirmation email (implement when ready)
        # await send_confirmation_email(data.email)

        print(f"Newsletter signup: {data.email} - {data.name or 'Anonymous'}")

        return NewsletterSignupResponse(
            message="Successfully subscribed to newsletter! Check your email for confirmation.",
            email=data.email,
            status="pending_confirmation"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Newsletter subscription error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process subscription. Please try again later."
        )


@router.post("/unsubscribe")
async def unsubscribe_newsletter(email: str):
    """
    Unsubscribe from newsletter
    
    Query Parameters:
        email: Email to unsubscribe
    
    Response:
    {
        "message": "Successfully unsubscribed from newsletter"
    }
    """
    try:
        if not email or "@" not in email:
            raise ValueError("Invalid email format")

        # Mock data - Replace with database update when ready
        # Example:
        # subscription = db.query(NewsletterSubscription).filter(
        #     NewsletterSubscription.email == email
        # ).first()
        # if subscription:
        #     subscription.status = "unsubscribed"
        #     subscription.unsubscribed_at = datetime.utcnow()
        #     db.commit()

        print(f"Newsletter unsubscribe: {email}")

        return {
            "message": "Successfully unsubscribed from newsletter",
            "email": email
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Newsletter unsubscribe error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process unsubscribe. Please try again later."
        )


@router.get("/status/{email}")
async def get_subscription_status(email: str):
    """
    Check if email is subscribed to newsletter
    
    Path Parameters:
        email: Email to check
    
    Response:
    {
        "email": "user@example.com",
        "status": "subscribed",
        "subscribed_at": "2026-08-21T10:30:00"
    }
    """
    try:
        if not email or "@" not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Mock data - Replace with database query when ready
        # Example:
        # subscription = db.query(NewsletterSubscription).filter(
        #     NewsletterSubscription.email == email
        # ).first()
        # if not subscription:
        #     raise HTTPException(status_code=404, detail="Email not found")

        return {
            "email": email,
            "status": "subscribed",  # or "unsubscribed", "pending_confirmation"
            "subscribed_at": "2026-08-21T10:30:00"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Status check error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check subscription status"
        )


# ════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ════════════════════════════════════════════════════════════════════════════

@router.get("/health")
async def health_check():
    """Health check for newsletter API"""
    return {
        "status": "ok",
        "service": "newsletter",
        "timestamp": datetime.utcnow().isoformat()
    }
