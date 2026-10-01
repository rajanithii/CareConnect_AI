"""
Module 7: Blood Expiry Management Routes
Endpoints for expiry alerts, FIFO recommendations, and wastage reports.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.auth_decorator import verify_hospital_token
from app.utils.validators import validate_blood_group
from app.blood_expiry.schemas import (
    ExpiryDashboardOut,
    FIFORecommendationOut,
    ExpiryAlertOut,
    ExpiryReportOut,
    DismissAlertInput,
    GenerateExpiryReportInput,
)
from app.blood_expiry.service import get_expiry_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/blood-expiry", tags=["Blood Expiry Management"])


@router.post("/scan-and-alert", response_model=ExpiryDashboardOut)
def scan_expiry(
    hospital_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    if user.get("role") == "hospital" and user.get("id") != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")
    """
    Scan all blood units and generate expiry alerts.

    Identifies:
    - EXPIRED units (past expiry date) — mark for discard
    - URGENT units (expiring within 7 days) — use immediately
    - WARNING units (expiring within 30 days) — monitor closely

    Returns: ExpiryDashboardOut with alerts and FIFO recommendations

    Args:
        hospital_id: Target hospital (query param)

    Returns:
        ExpiryDashboardOut with active alerts and FIFO recommendations

    Raises:
        500: Internal error
    """
    try:
        logger.info(f"Expiry scan request for hospital {hospital_id}")
        
        service = get_expiry_service(db)
        dashboard = service.scan_and_alert_expiry(hospital_id)
        
        logger.info(f"Scan complete: {dashboard.expiring_breakdown['EXPIRED']} expired units found")
        return dashboard

    except Exception as e:
        logger.exception("Error scanning expiry")
        raise HTTPException(status_code=500, detail="Expiry scan failed")


@router.get("/fifo-recommendation", response_model=FIFORecommendationOut | None)
def get_fifo_recommendation(
    hospital_id: int,
    blood_group: str,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Get FIFO (First-In-First-Out) recommendation for blood group.

    Recommends using the unit with earliest expiry date first
    to minimize wastage and ensure freshest blood.

    Args:
        hospital_id: Target hospital
        blood_group: Blood group (e.g., "O+")

    Returns:
        FIFORecommendationOut with recommended unit, or None if no stock

    Raises:
        500: Internal error
    """
    if user.get("role") == "hospital" and user.get("id") != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")

    blood_group = validate_blood_group(blood_group)

    try:
        service = get_expiry_service(db)
        recommendation = service.get_fifo_recommendation(hospital_id, blood_group)
        
        if recommendation:
            logger.info(f"FIFO recommendation for {blood_group}: {recommendation.recommended_unit_code}")
        return recommendation

    except Exception as e:
        logger.exception("Error getting FIFO recommendation")
        raise HTTPException(status_code=500, detail="Failed to get FIFO recommendation")


@router.post("/alerts/{alert_id}/dismiss", response_model=ExpiryAlertOut)
def dismiss_expiry_alert(
    alert_id: int,
    payload: DismissAlertInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Dismiss an expiry alert (e.g., if unit was already used/discarded).

    Args:
        alert_id: Alert ID to dismiss
        payload.reason: Optional reason for dismissal

    Returns:
        Updated ExpiryAlertOut with DISMISSED status

    Raises:
        404: Alert not found
    """
    try:
        service = get_expiry_service(db)
        alert = service.dismiss_alert(alert_id, payload.reason)
        return alert

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error dismissing alert")
        raise HTTPException(status_code=500, detail="Failed to dismiss alert")


@router.post("/reports/generate", response_model=ExpiryReportOut)
def generate_expiry_report(
    payload: GenerateExpiryReportInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Generate monthly expiry wastage report.

    Analyzes:
    - Total units expired/discarded
    - Breakdown by blood group
    - FIFO compliance rate
    - Improvement recommendations

    Args:
        payload.hospital_id: Target hospital
        payload.report_period: Period in "YYYY-MM" format (e.g., "2026-08")

    Returns:
        ExpiryReportOut with full wastage analysis

    Raises:
        400: Invalid period format
        500: Internal error
    """
    if user.get("role") == "hospital" and user.get("id") != payload.hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")
    try:
        logger.info(f"Generate expiry report: {payload.hospital_id} for {payload.report_period}")
        
        service = get_expiry_service(db)
        report = service.generate_expiry_report(payload.hospital_id, payload.report_period)
        
        logger.info(f"Report generated: {report.total_wastage} units wasted")
        return report

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error generating expiry report")
        raise HTTPException(status_code=500, detail="Failed to generate report")


@router.get("/health")
def health_check():
    """Health check for blood expiry service."""
    return {"status": "ok", "service": "blood-expiry"}
