"""
Module 8: Advanced Admin Portal Routes
Endpoints for hospital approvals, audit logging, system monitoring, alerts.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.auth_decorator import verify_admin_token
from app.admin_portal.schemas import (
    HospitalApprovalRequestOut,
    ApproveHospitalInput,
    RejectHospitalInput,
    AuditLogOut,
    SystemAlertOut,
    AdminDashboardOut,
    AuditLogFilterInput,
)
from app.admin_portal.service import get_admin_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


# ========== HOSPITAL APPROVALS ==========

@router.post("/approvals/submit", response_model=HospitalApprovalRequestOut)
def submit_hospital_approval(
    hospital_name: str,
    hospital_email: str,
    hospital_phone: str | None = None,
    hospital_address: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Submit a new hospital for admin approval.

    Hospitals must be approved by admin before full system access.

    Args:
        hospital_name: Name of hospital
        hospital_email: Contact email
        hospital_phone: Contact phone (optional)
        hospital_address: Hospital address (optional)

    Returns:
        HospitalApprovalRequestOut with PENDING status

    Raises:
        400: Invalid input
    """
    try:
        logger.info(f"Hospital approval submission: {hospital_name}")
        
        service = get_admin_service(db)
        request = service.submit_approval_request(
            hospital_name=hospital_name,
            hospital_email=hospital_email,
            hospital_phone=hospital_phone,
            hospital_address=hospital_address,
        )
        return request

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error submitting approval")
        raise HTTPException(status_code=500, detail="Failed to submit approval request")


@router.get("/approvals/pending", response_model=list[HospitalApprovalRequestOut])
def get_pending_approvals(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Get all hospitals pending admin approval.

    **Admin-only endpoint.**

    Returns:
        List of HospitalApprovalRequestOut with PENDING status

    Raises:
        500: Internal error
    """
    try:
        service = get_admin_service(db)
        requests = service.get_pending_approvals()
        logger.info(f"Retrieved {len(requests)} pending approvals")
        return requests

    except Exception as e:
        logger.exception("Error fetching pending approvals")
        raise HTTPException(status_code=500, detail="Failed to fetch pending approvals")


@router.post("/approvals/{hospital_id}/approve", response_model=HospitalApprovalRequestOut)
def approve_hospital(
    hospital_id: int,
    payload: ApproveHospitalInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Approve a hospital registration request.

    **Admin-only endpoint.**

    Grants hospital full access to BloodLink system.

    Args:
        hospital_id: Hospital ID to approve
        payload.approval_notes: Optional approval notes

    Returns:
        Updated HospitalApprovalRequestOut with APPROVED status

    Raises:
        404: Hospital request not found
        500: Internal error
    """
    try:
        admin_email = user.get("email", "admin@bloodlink.com")
        
        service = get_admin_service(db)
        request = service.approve_hospital(
            hospital_id=hospital_id,
            admin_email=admin_email,
            approval_notes=payload.approval_notes,
        )
        logger.info(f"Hospital {hospital_id} approved")
        return request

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error approving hospital")
        raise HTTPException(status_code=500, detail="Failed to approve hospital")


@router.post("/approvals/{hospital_id}/reject", response_model=HospitalApprovalRequestOut)
def reject_hospital(
    hospital_id: int,
    payload: RejectHospitalInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Reject a hospital registration request.

    **Admin-only endpoint.**

    Args:
        hospital_id: Hospital ID to reject
        payload.rejection_reason: Reason for rejection

    Returns:
        Updated HospitalApprovalRequestOut with REJECTED status

    Raises:
        404: Hospital request not found
    """
    try:
        admin_email = user.get("email", "admin@bloodlink.com")
        
        service = get_admin_service(db)
        request = service.reject_hospital(
            hospital_id=hospital_id,
            admin_email=admin_email,
            rejection_reason=payload.rejection_reason,
        )
        logger.info(f"Hospital {hospital_id} rejected")
        return request

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error rejecting hospital")
        raise HTTPException(status_code=500, detail="Failed to reject hospital")


# ========== AUDIT LOGGING ==========

@router.get("/audit-logs", response_model=list[AuditLogOut])
def get_audit_logs(
    hospital_id: int | None = None,
    action: str | None = None,
    days_lookback: int = 7,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Retrieve audit logs with optional filters.

    **Admin-only endpoint.**

    Complete audit trail of all system actions for compliance.

    Args:
        hospital_id: Filter by hospital (optional)
        action: Filter by action type (optional)
        days_lookback: How many days to look back (default 7)
        limit: Max results (default 100)

    Returns:
        List of AuditLogOut entries, newest first

    Raises:
        500: Internal error
    """
    try:
        service = get_admin_service(db)
        logs = service.get_audit_logs(
            hospital_id=hospital_id,
            action=action,
            days_lookback=days_lookback,
            limit=limit,
        )
        logger.info(f"Retrieved {len(logs)} audit logs")
        return logs

    except Exception as e:
        logger.exception("Error fetching audit logs")
        raise HTTPException(status_code=500, detail="Failed to fetch audit logs")


# ========== SYSTEM ALERTS ==========

@router.get("/alerts", response_model=list[SystemAlertOut])
def get_system_alerts(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Get all active system alerts.

    **Admin-only endpoint.**

    System alerts cover critical issues like:
    - Blood shortages across multiple hospitals
    - High wastage rates
    - API/database errors
    - Service unavailability

    Returns:
        List of active SystemAlertOut

    Raises:
        500: Internal error
    """
    try:
        service = get_admin_service(db)
        alerts = service.get_active_alerts()
        logger.info(f"Retrieved {len(alerts)} active system alerts")
        return alerts

    except Exception as e:
        logger.exception("Error fetching system alerts")
        raise HTTPException(status_code=500, detail="Failed to fetch system alerts")


@router.post("/alerts/{alert_id}/acknowledge", response_model=SystemAlertOut)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Acknowledge a system alert.

    **Admin-only endpoint.**

    Marks alert as acknowledged by admin (but not resolved).

    Args:
        alert_id: Alert ID to acknowledge

    Returns:
        Updated SystemAlertOut

    Raises:
        404: Alert not found
    """
    try:
        service = get_admin_service(db)
        alert = service.acknowledge_alert(alert_id)
        logger.info(f"Alert {alert_id} acknowledged")
        return alert

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error acknowledging alert")
        raise HTTPException(status_code=500, detail="Failed to acknowledge alert")


@router.post("/alerts/{alert_id}/resolve", response_model=SystemAlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Resolve a system alert.

    **Admin-only endpoint.**

    Marks alert as resolved (issue has been addressed).

    Args:
        alert_id: Alert ID to resolve

    Returns:
        Updated SystemAlertOut with RESOLVED status

    Raises:
        404: Alert not found
    """
    try:
        service = get_admin_service(db)
        alert = service.resolve_alert(alert_id)
        logger.info(f"Alert {alert_id} resolved")
        return alert

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error resolving alert")
        raise HTTPException(status_code=500, detail="Failed to resolve alert")


# ========== ADMIN DASHBOARD ==========

@router.get("/dashboard", response_model=AdminDashboardOut)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_admin_token),
):
    """
    Get complete admin dashboard.

    **Admin-only endpoint.**

    Comprehensive view of system health including:
    - Current snapshot (hospitals, blood units, activity)
    - Pending hospital approvals
    - Active system alerts
    - Recent audit logs

    Returns:
        AdminDashboardOut with all monitoring data

    Raises:
        500: Internal error
    """
    try:
        service = get_admin_service(db)
        dashboard = service.get_admin_dashboard()
        logger.info("Admin dashboard generated")
        return dashboard

    except Exception as e:
        logger.exception("Error generating admin dashboard")
        raise HTTPException(status_code=500, detail="Failed to generate dashboard")


@router.get("/health")
def health_check():
    """Health check for admin portal service."""
    return {"status": "ok", "service": "admin-portal"}
