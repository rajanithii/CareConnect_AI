"""
Module 6: Inter-Hospital Blood Exchange Routes
Endpoints for requesting, approving, and completing blood transfers.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.auth_decorator import verify_hospital_token
from app.utils.validators import validate_blood_group, sanitize_text
from app.inter_hospital_exchange.schemas import (
    CreateTransferRequestInput,
    BloodTransferRequestOut,
    ApproveTransferInput,
    CompleteTransferInput,
    BloodTransferLogOut,
    PendingTransfersOut,
)
from app.inter_hospital_exchange.service import get_exchange_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inter-hospital-exchange", tags=["Inter-Hospital Blood Exchange"])


@router.post("/transfer/request", response_model=BloodTransferRequestOut)
def request_blood_transfer(
    payload: CreateTransferRequestInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    if user.get("role") == "hospital" and user.get("id") != payload.requesting_hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized requesting hospital")
    """
    Request blood transfer from another hospital.

    Creates a transfer request that the supplying hospital must approve.

    Args:
        payload.requesting_hospital_id: Hospital requesting blood
        payload.supplying_hospital_id: Hospital to request from
        payload.blood_group: Blood group needed
        payload.quantity_requested: Units needed (1-100)
        payload.urgency: Request urgency (LOW/MEDIUM/HIGH/CRITICAL)
        payload.reason: Why blood is needed

    Returns:
        BloodTransferRequestOut with PENDING status

    Raises:
        400: Invalid input
    """
    try:
        service = get_exchange_service(db)
        transfer = service.request_transfer(
            requesting_hospital_id=payload.requesting_hospital_id,
            supplying_hospital_id=payload.supplying_hospital_id,
            blood_group=payload.blood_group,
            quantity_requested=payload.quantity_requested,
            urgency=payload.urgency,
            reason=payload.reason,
        )
        return transfer

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error creating transfer request")
        raise HTTPException(status_code=500, detail="Failed to create transfer request")


@router.post("/transfer/{transfer_id}/approve", response_model=BloodTransferRequestOut)
def approve_transfer(
    transfer_id: int,
    payload: ApproveTransferInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Approve a blood transfer request.

    Supplying hospital approves the transfer and confirms quantity available.

    Args:
        transfer_id: Transfer request ID
        payload.quantity_approved: Units to approve (≤ requested)
        payload.approval_notes: Optional notes

    Returns:
        Updated BloodTransferRequestOut with APPROVED status

    Raises:
        404: Transfer not found
        400: Invalid quantity
    """
    try:
        service = get_exchange_service(db)
        transfer = service.approve_transfer(
            transfer_id=transfer_id,
            quantity_approved=payload.quantity_approved,
            approval_notes=payload.approval_notes,
        )
        return transfer

    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error approving transfer")
        raise HTTPException(status_code=500, detail="Failed to approve transfer")


@router.post("/transfer/{transfer_id}/reject", response_model=BloodTransferRequestOut)
def reject_transfer(
    transfer_id: int,
    reason: str,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Reject a blood transfer request.

    Args:
        transfer_id: Transfer request ID
        reason: Reason for rejection (query param)

    Returns:
        Updated BloodTransferRequestOut with REJECTED status

    Raises:
        404: Transfer not found
    """
    try:
        service = get_exchange_service(db)
        transfer = service.reject_transfer(transfer_id, reason)
        return transfer

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error rejecting transfer")
        raise HTTPException(status_code=500, detail="Failed to reject transfer")


@router.post("/transfer/{transfer_id}/complete", response_model=BloodTransferLogOut)
def complete_transfer(
    transfer_id: int,
    payload: CompleteTransferInput,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Mark transfer as completed and log details.

    Records actual units transferred, dates, carrier, temperature info.

    Args:
        transfer_id: Transfer request ID
        payload: Completion details

    Returns:
        BloodTransferLogOut with transfer completion record

    Raises:
        404: Transfer not found
        400: Transfer not approved or other error
    """
    try:
        service = get_exchange_service(db)
        log = service.complete_transfer(
            transfer_id=transfer_id,
            units_transferred=payload.units_transferred,
            shipped_date=payload.shipped_date,
            received_date=payload.received_date,
            carrier=payload.carrier,
            temperature_maintained=payload.temperature_maintained,
            notes=payload.notes,
        )
        return log

    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error completing transfer")
        raise HTTPException(status_code=500, detail="Failed to complete transfer")


@router.get("/pending", response_model=PendingTransfersOut)
def get_pending_transfers(
    hospital_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Get all pending transfer requests for a hospital.

    Shows both incoming requests (we're supplying) and outgoing (we're requesting).

    Args:
        hospital_id: Target hospital (query param)

    Returns:
        PendingTransfersOut with pending transfer list
    """
    if user.get("role") == "hospital" and user.get("id") != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")

    try:
        service = get_exchange_service(db)
        pending = service.get_pending_transfers(hospital_id)
        return pending

    except Exception as e:
        logger.exception("Error fetching pending transfers")
        raise HTTPException(status_code=500, detail="Failed to fetch pending transfers")


@router.get("/history", response_model=list[BloodTransferLogOut])
def get_transfer_history(
    hospital_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_hospital_token),
):
    """
    Get completed transfer history for a hospital.

    Args:
        hospital_id: Target hospital (query param)
        limit: Max results to return (default 50)

    Returns:
        List of completed BloodTransferLogOut entries
    """
    if user.get("role") == "hospital" and user.get("id") != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized hospital")

    try:
        service = get_exchange_service(db)
        history = service.get_transfer_history(hospital_id, limit)
        return history

    except Exception as e:
        logger.exception("Error fetching transfer history")
        raise HTTPException(status_code=500, detail="Failed to fetch transfer history")


@router.get("/health")
def health_check():
    """Health check for inter-hospital exchange service."""
    return {"status": "ok", "service": "inter-hospital-exchange"}
