"""
Module 6: Inter-Hospital Blood Exchange Service
Manages blood transfer requests between hospitals.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app.inter_hospital_exchange.models import BloodTransferRequest, BloodTransferLog
from app.inter_hospital_exchange.schemas import (
    BloodTransferRequestOut,
    BloodTransferLogOut,
    PendingTransfersOut,
)

logger = logging.getLogger(__name__)


class InterHospitalExchangeService:
    """Manages blood transfers between hospitals."""

    def __init__(self, db: Session):
        self.db = db

    def request_transfer(
        self,
        requesting_hospital_id: int,
        supplying_hospital_id: int,
        blood_group: str,
        quantity_requested: int,
        urgency: str = "MEDIUM",
        reason: str | None = None,
    ) -> BloodTransferRequestOut:
        """
        Create a blood transfer request from one hospital to another.

        Args:
            requesting_hospital_id: Hospital needing blood
            supplying_hospital_id: Hospital that can supply
            blood_group: Blood group needed
            quantity_requested: Units requested
            urgency: Request urgency (LOW/MEDIUM/HIGH/CRITICAL)
            reason: Why blood is needed

        Returns:
            BloodTransferRequestOut

        Raises:
            ValueError: If input invalid
        """
        if requesting_hospital_id == supplying_hospital_id:
            raise ValueError("Cannot request from same hospital")

        if quantity_requested < 1 or quantity_requested > 100:
            raise ValueError("Quantity must be between 1 and 100")

        request = BloodTransferRequest(
            requesting_hospital_id=requesting_hospital_id,
            supplying_hospital_id=supplying_hospital_id,
            blood_group=blood_group,
            quantity_requested=quantity_requested,
            urgency=urgency,
            reason=reason,
        )
        self.db.add(request)
        self.db.commit()
        logger.info(
            f"Transfer request created: {requesting_hospital_id} requesting {quantity_requested} units of {blood_group} from {supplying_hospital_id}"
        )
        return BloodTransferRequestOut.model_validate(request)

    def approve_transfer(
        self,
        transfer_id: int,
        quantity_approved: int,
        approval_notes: str | None = None,
    ) -> BloodTransferRequestOut:
        """
        Approve a transfer request.

        Args:
            transfer_id: Transfer request ID
            quantity_approved: Units approved (≤ requested)
            approval_notes: Optional approval notes

        Returns:
            Updated BloodTransferRequestOut

        Raises:
            ValueError: If transfer not found or invalid quantity
        """
        transfer = self.db.query(BloodTransferRequest).filter_by(id=transfer_id).first()
        if not transfer:
            raise ValueError(f"Transfer request {transfer_id} not found")

        if quantity_approved > transfer.quantity_requested:
            raise ValueError("Approved quantity cannot exceed requested")

        transfer.status = "APPROVED"
        transfer.quantity_approved = quantity_approved
        transfer.approval_notes = approval_notes
        transfer.approved_date = datetime.utcnow()

        self.db.commit()
        logger.info(f"Transfer request {transfer_id} approved for {quantity_approved} units")
        return BloodTransferRequestOut.model_validate(transfer)

    def reject_transfer(self, transfer_id: int, reason: str) -> BloodTransferRequestOut:
        """Reject a transfer request."""
        transfer = self.db.query(BloodTransferRequest).filter_by(id=transfer_id).first()
        if not transfer:
            raise ValueError(f"Transfer request {transfer_id} not found")

        transfer.status = "REJECTED"
        transfer.approval_notes = reason
        transfer.approved_date = datetime.utcnow()

        self.db.commit()
        logger.info(f"Transfer request {transfer_id} rejected")
        return BloodTransferRequestOut.model_validate(transfer)

    def complete_transfer(
        self,
        transfer_id: int,
        units_transferred: int,
        shipped_date: datetime | None = None,
        received_date: datetime | None = None,
        carrier: str | None = None,
        temperature_maintained: str | None = None,
        notes: str | None = None,
    ) -> BloodTransferLogOut:
        """
        Mark a transfer as completed and log the details.

        Args:
            transfer_id: Transfer request ID
            units_transferred: Actual units transferred
            shipped_date: When blood shipped
            received_date: When blood received
            carrier: Transportation company/method
            temperature_maintained: Temperature info
            notes: Completion notes

        Returns:
            BloodTransferLogOut

        Raises:
            ValueError: If transfer not found or not approved
        """
        transfer = self.db.query(BloodTransferRequest).filter_by(id=transfer_id).first()
        if not transfer:
            raise ValueError(f"Transfer request {transfer_id} not found")

        if transfer.status != "APPROVED":
            raise ValueError(f"Transfer must be approved before completion (current: {transfer.status})")

        # Create transfer log
        log = BloodTransferLog(
            transfer_request_id=transfer_id,
            from_hospital_id=transfer.supplying_hospital_id,
            to_hospital_id=transfer.requesting_hospital_id,
            blood_units_transferred=units_transferred,
            blood_group=transfer.blood_group,
            shipped_date=shipped_date or datetime.utcnow(),
            received_date=received_date,
            carrier=carrier,
            temperature_maintained=str(temperature_maintained) if temperature_maintained is not None else None,
            notes=notes,
        )
        self.db.add(log)

        # Update transfer status
        transfer.status = "COMPLETED"
        transfer.completed_date = datetime.utcnow()
        self.db.commit()

        logger.info(f"Transfer {transfer_id} completed: {units_transferred} units transferred")
        return BloodTransferLogOut.model_validate(log)

    def get_pending_transfers(self, hospital_id: int) -> PendingTransfersOut:
        """
        Get all pending transfer requests for a hospital.

        Args:
            hospital_id: Target hospital

        Returns:
            PendingTransfersOut with incoming and outgoing requests
        """
        # Requests where this hospital is requesting (outgoing)
        outgoing = self.db.query(BloodTransferRequest).filter(
            BloodTransferRequest.requesting_hospital_id == hospital_id,
            BloodTransferRequest.status == "PENDING",
        ).all()

        # Requests where this hospital is supplying (incoming)
        incoming = self.db.query(BloodTransferRequest).filter(
            BloodTransferRequest.supplying_hospital_id == hospital_id,
            BloodTransferRequest.status == "PENDING",
        ).all()

        return PendingTransfersOut(
            hospital_id=hospital_id,
            summary_date=datetime.utcnow(),
            incoming_requests=[BloodTransferRequestOut.model_validate(r) for r in incoming],
            outgoing_requests=[BloodTransferRequestOut.model_validate(r) for r in outgoing],
            total_pending=len(incoming) + len(outgoing),
        )

    def get_transfer_history(self, hospital_id: int, limit: int = 50) -> list[BloodTransferLogOut]:
        """Get completed transfers for a hospital."""
        logs = self.db.query(BloodTransferLog).filter(
            (BloodTransferLog.from_hospital_id == hospital_id)
            | (BloodTransferLog.to_hospital_id == hospital_id)
        ).order_by(BloodTransferLog.created_at.desc()).limit(limit).all()

        return [BloodTransferLogOut.model_validate(log) for log in logs]


def get_exchange_service(db: Session) -> InterHospitalExchangeService:
    """Factory function."""
    return InterHospitalExchangeService(db)
