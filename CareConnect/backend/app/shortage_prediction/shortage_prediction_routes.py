"""
Module 4: Blood Shortage Prediction Routes
Endpoints for predicting shortages and managing alerts.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.auth_decorator import verify_hospital_token
from app.shortage_prediction.schemas import (
    ShortageAnalysisInput,
    ShortageSummaryOut,
    ShortageAlertOut,
    ResolveAlertInput,
)
from app.shortage_prediction.shortage_prediction_service import get_shortage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/shortage-prediction", tags=["Blood Shortage Prediction"])


@router.post("/analyze", response_model=ShortageSummaryOut)
def predict_shortages(
    payload: ShortageAnalysisInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    if user.get("role") == "hospital" and user.get("id") != payload.hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")
    """
    Analyze blood shortage risk across all blood groups.

    Compares current inventory vs forecasted demand to generate:
    - Individual blood group alerts (CRITICAL/HIGH/MEDIUM)
    - Overall hospital risk assessment
    - Actionable recommendations

    Args:
        payload.hospital_id: Target hospital
        payload.days_ahead: Forecast horizon (1-30 days, default 7)

    Returns:
        ShortageSummaryOut with alerts, risk assessment, recommendations

    Raises:
        400: Invalid input
        500: Internal error
    """
    try:
        logger.info(f"Shortage analysis request: hospital={payload.hospital_id}, days={payload.days_ahead}")
        
        service = get_shortage_service(db)
        result = service.predict_shortages(
            hospital_id=payload.hospital_id,
            days_ahead=payload.days_ahead,
        )
        
        logger.info(f"Shortage analysis completed: {result.risk_assessment.overall_risk} risk")
        return result

    except ValueError as e:
        logger.error(f"Shortage prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error in shortage analysis")
        raise HTTPException(status_code=500, detail="Shortage analysis failed")


@router.get("/alerts", response_model=list[ShortageAlertOut])
def get_active_alerts(
    hospital_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Get all active shortage alerts for a hospital.

    Args:
        hospital_id: Target hospital

    Returns:
        List of active shortage alerts
    """
    if user.get("role") == "hospital" and user.get("id") != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")

    try:
        service = get_shortage_service(db)
        alerts = service.get_active_alerts(hospital_id)
        return alerts

    except Exception as e:
        logger.exception("Error fetching alerts")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")


@router.post("/alerts/{alert_id}/resolve", response_model=ShortageAlertOut)
def resolve_alert(
    alert_id: int,
    payload: ResolveAlertInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Mark a shortage alert as resolved.

    Args:
        alert_id: Alert ID to resolve
        payload.resolution_notes: Optional resolution notes

    Returns:
        Updated alert with resolved status
    """
    try:
        service = get_shortage_service(db)
        alert = service.resolve_alert(alert_id, payload.resolution_notes)
        return alert

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error resolving alert")
        raise HTTPException(status_code=500, detail="Failed to resolve alert")


@router.get("/health")
def health_check():
    """Health check for shortage prediction service."""
    return {"status": "ok", "service": "shortage-prediction"}
