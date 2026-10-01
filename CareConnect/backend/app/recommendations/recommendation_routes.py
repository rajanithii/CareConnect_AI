"""
Module 5: Recommendation Engine Routes
Endpoints for generating and managing recommendations.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.auth_decorator import verify_hospital_token
from app.utils.validators import validate_blood_group, sanitize_text
from app.recommendations.schemas import (
    GenerateRecommendationsInput,
    RecommendationSummaryOut,
    UpdateRecommendationInput,
    RecommendationOut,
    StartCampaignInput,
    DonorCampaignOut,
)
from app.recommendations.recommendation_service import get_recommendation_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])


@router.post("/generate", response_model=RecommendationSummaryOut)
def generate_recommendations(
    payload: GenerateRecommendationsInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    if user.get("role") == "hospital" and user.get("id") != payload.hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")
    """
    Generate smart recommendations for blood management.

    Analyzes demand forecasts, current inventory, and shortage risks
    to recommend actions such as:
    - Launch donor campaigns for low-stock blood groups
    - Use expiring inventory before wastage
    - Schedule procedures based on inventory availability
    - Coordinate inter-hospital transfers

    Args:
        payload.hospital_id: Target hospital

    Returns:
        RecommendationSummaryOut with all active recommendations and campaigns

    Raises:
        400: Invalid input
        500: Internal error
    """
    try:
        logger.info(f"Generate recommendations request: hospital={payload.hospital_id}")
        
        service = get_recommendation_service(db)
        result = service.generate_recommendations(payload.hospital_id)
        
        logger.info(f"Generated {result.total_recommendations} recommendations")
        return result

    except ValueError as e:
        logger.error(f"Recommendation generation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error generating recommendations")
        raise HTTPException(status_code=500, detail="Recommendation generation failed")


@router.patch("/recommendations/{rec_id}", response_model=RecommendationOut)
def update_recommendation(
    rec_id: int,
    payload: UpdateRecommendationInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Update recommendation status (e.g., mark as completed).

    Args:
        rec_id: Recommendation ID
        payload.status: New status (PENDING, IN_PROGRESS, COMPLETED, DISMISSED)
        payload.notes: Optional update notes

    Returns:
        Updated recommendation

    Raises:
        404: Recommendation not found
        500: Internal error
    """
    try:
        service = get_recommendation_service(db)
        rec = service.update_recommendation(rec_id, payload.status, payload.notes)
        return rec

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error updating recommendation")
        raise HTTPException(status_code=500, detail="Failed to update recommendation")


@router.post("/campaigns/start", response_model=DonorCampaignOut)
def start_donor_campaign(
    payload: StartCampaignInput,
    hospital_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Start a new donor campaign for a specific blood group.

    Args:
        hospital_id: Hospital initiating campaign (query param)
        payload.blood_group: Target blood group (e.g., "O+")
        payload.campaign_name: Campaign name
        payload.target_units: Target units to collect

    Returns:
        DonorCampaignOut with campaign details

    Raises:
        400: Invalid input
        500: Internal error
    """
    if user.get("role") == "hospital" and user.get("id") != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")

    # Validate and sanitize input
    blood_group = validate_blood_group(payload.blood_group)
    campaign_name = sanitize_text(payload.campaign_name)

    try:
        logger.info(f"Start campaign: {campaign_name} for {blood_group}")
        
        service = get_recommendation_service(db)
        campaign = service.start_campaign(
            hospital_id=hospital_id,
            blood_group=blood_group,
            campaign_name=campaign_name,
            target_units=payload.target_units,
        )
        return campaign

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error starting campaign")
        raise HTTPException(status_code=500, detail="Failed to start campaign")


@router.patch("/campaigns/{campaign_id}", response_model=DonorCampaignOut)
def update_donor_campaign(
    campaign_id: int,
    units_collected: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Update campaign progress or status.

    Args:
        campaign_id: Campaign ID
        units_collected: Units collected so far (optional)
        status: Campaign status (optional)

    Returns:
        Updated campaign

    Raises:
        404: Campaign not found
    """
    try:
        service = get_recommendation_service(db)
        campaign = service.update_campaign(campaign_id, units_collected, status)
        return campaign

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error updating campaign")
        raise HTTPException(status_code=500, detail="Failed to update campaign")


@router.get("/health")
def health_check():
    """Health check for recommendation service."""
    return {"status": "ok", "service": "recommendations"}
