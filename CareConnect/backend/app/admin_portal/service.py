"""
Module 8: Advanced Admin Portal Service

Manages hospital approvals, audit logging, system alerts, and dashboards.
Provides complete visibility into BloodLink system operations.
"""

import logging
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.blood_inventory import BloodUnit
from app.models.blood_request import BloodRequest
from app.admin_portal.models import (
    HospitalApprovalRequest,
    AuditLog,
    SystemAlert,
    AdminDashboardSnapshot,
)
from app.admin_portal.schemas import (
    HospitalApprovalRequestOut,
    AuditLogOut,
    SystemAlertOut,
    AdminDashboardSnapshotOut,
    AdminDashboardOut,
)

logger = logging.getLogger(__name__)


class AdminPortalService:
    """Manages admin functions: approvals, auditing, monitoring, alerts."""

    def __init__(self, db: Session):
        self.db = db

    # ========== HOSPITAL APPROVALS ==========

    def submit_approval_request(
        self,
        hospital_name: str,
        hospital_email: str,
        hospital_phone: str | None = None,
        hospital_address: str | None = None,
        request_type: str = "NEW_REGISTRATION",
    ) -> HospitalApprovalRequestOut:
        """Submit hospital for admin approval."""
        request = HospitalApprovalRequest(
            hospital_name=hospital_name,
            hospital_email=hospital_email,
            hospital_phone=hospital_phone,
            hospital_address=hospital_address,
            request_type=request_type,
        )
        self.db.add(request)
        self.db.commit()
        logger.info(f"Approval request submitted: {hospital_name}")
        return HospitalApprovalRequestOut.model_validate(request)

    def get_pending_approvals(self) -> list[HospitalApprovalRequestOut]:
        """Get all hospitals pending admin approval."""
        requests = self.db.query(HospitalApprovalRequest).filter_by(
            status="PENDING"
        ).order_by(HospitalApprovalRequest.submitted_date.asc()).all()

        return [HospitalApprovalRequestOut.model_validate(r) for r in requests]

    def approve_hospital(
        self,
        hospital_id: int,
        admin_email: str,
        approval_notes: str | None = None,
    ) -> HospitalApprovalRequestOut:
        """Approve a hospital for system access."""
        request = self.db.query(HospitalApprovalRequest).filter(
            (HospitalApprovalRequest.hospital_id == hospital_id) | (HospitalApprovalRequest.id == hospital_id)
        ).first()
        if not request:
            raise ValueError(f"No approval request for hospital {hospital_id}")

        request.status = "APPROVED"
        request.reviewed_date = datetime.utcnow()
        request.reviewed_by = admin_email
        request.approval_notes = approval_notes

        self.db.commit()
        logger.info(f"Hospital {hospital_id} approved by {admin_email}")
        return HospitalApprovalRequestOut.model_validate(request)

    def reject_hospital(
        self,
        hospital_id: int,
        admin_email: str,
        rejection_reason: str,
    ) -> HospitalApprovalRequestOut:
        """Reject hospital approval request."""
        request = self.db.query(HospitalApprovalRequest).filter(
            (HospitalApprovalRequest.hospital_id == hospital_id) | (HospitalApprovalRequest.id == hospital_id)
        ).first()
        if not request:
            raise ValueError(f"No approval request for hospital {hospital_id}")

        request.status = "REJECTED"
        request.reviewed_date = datetime.utcnow()
        request.reviewed_by = admin_email
        request.rejection_reason = rejection_reason

        self.db.commit()
        logger.info(f"Hospital {hospital_id} rejected by {admin_email}")
        return HospitalApprovalRequestOut.model_validate(request)

    # ========== AUDIT LOGGING ==========

    def log_action(
        self,
        action: str,
        entity_type: str | None = None,
        entity_id: int | None = None,
        hospital_id: int | None = None,
        user_email: str | None = None,
        old_value: dict | None = None,
        new_value: dict | None = None,
        status: str = "SUCCESS",
        error_message: str | None = None,
        ip_address: str | None = None,
    ) -> None:
        """Log an action for audit trail."""
        log = AuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            hospital_id=hospital_id,
            user_email=user_email,
            old_value=old_value,
            new_value=new_value,
            status=status,
            error_message=error_message,
            ip_address=ip_address,
        )
        self.db.add(log)
        self.db.commit()

    def get_audit_logs(
        self,
        hospital_id: int | None = None,
        action: str | None = None,
        days_lookback: int = 7,
        limit: int = 100,
    ) -> list[AuditLogOut]:
        """Retrieve audit logs with optional filters."""
        cutoff = datetime.utcnow() - timedelta(days=days_lookback)

        query = self.db.query(AuditLog).filter(AuditLog.timestamp >= cutoff)

        if hospital_id:
            query = query.filter(AuditLog.hospital_id == hospital_id)
        if action:
            query = query.filter(AuditLog.action == action)

        logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
        return [AuditLogOut.model_validate(log) for log in logs]

    # ========== SYSTEM ALERTS ==========

    def create_system_alert(
        self,
        alert_type: str,
        message: str,
        severity: str = "MEDIUM",
        details: str | None = None,
        affected_hospitals: str | None = None,
    ) -> SystemAlertOut:
        """Create a system-wide alert for admins."""
        alert = SystemAlert(
            alert_type=alert_type,
            message=message,
            severity=severity,
            details=details,
            affected_hospitals=affected_hospitals,
        )
        self.db.add(alert)
        self.db.commit()
        logger.warning(f"System alert created: {alert_type} - {message}")
        return SystemAlertOut.model_validate(alert)

    def get_active_alerts(self) -> list[SystemAlertOut]:
        """Get all active system alerts."""
        alerts = self.db.query(SystemAlert).filter_by(status="ACTIVE").order_by(
            SystemAlert.triggered_at.desc()
        ).all()

        return [SystemAlertOut.model_validate(a) for a in alerts]

    def acknowledge_alert(self, alert_id: int) -> SystemAlertOut:
        """Acknowledge an alert."""
        alert = self.db.query(SystemAlert).filter_by(id=alert_id).first()
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")

        alert.acknowledged_at = datetime.utcnow()
        self.db.commit()
        return SystemAlertOut.model_validate(alert)

    def resolve_alert(self, alert_id: int) -> SystemAlertOut:
        """Resolve an alert."""
        alert = self.db.query(SystemAlert).filter_by(id=alert_id).first()
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")

        alert.status = "RESOLVED"
        alert.resolved_at = datetime.utcnow()
        self.db.commit()
        return SystemAlertOut.model_validate(alert)

    # ========== DASHBOARD & MONITORING ==========

    def generate_dashboard_snapshot(self) -> AdminDashboardSnapshotOut:
        """Generate current system-wide dashboard snapshot."""
        from app.models.hospital import Hospital
        from app.inter_hospital_exchange.models import BloodTransferRequest

        # Count hospitals
        total_hospitals = self.db.query(Hospital).count()
        active_hospitals = (
            self.db.query(Hospital).filter_by(is_active=True).count()
            if hasattr(Hospital, "is_active")
            else total_hospitals
        )

        # Count blood units
        all_units = self.db.query(BloodUnit).all()
        total_units = len(all_units)

        # By status
        units_by_status = {}
        for unit in all_units:
            units_by_status[unit.status] = units_by_status.get(unit.status, 0) + 1

        # By blood group
        units_by_blood_group = {}
        for unit in all_units:
            units_by_blood_group[unit.blood_group] = (
                units_by_blood_group.get(unit.blood_group, 0) + 1
            )

        # Today's activity
        today = datetime.utcnow().date()
        total_requests = self.db.query(BloodRequest).filter(
            BloodRequest.created_at >= datetime.combine(today, datetime.min.time())
        ).count()

        total_transfers = self.db.query(BloodTransferRequest).filter(
            BloodTransferRequest.requested_date >= datetime.combine(today, datetime.min.time())
        ).count()

        active_alerts = self.db.query(SystemAlert).filter_by(status="ACTIVE").count()

        # Health score (0-100)
        health_score = 100
        if active_alerts > 5:
            health_score -= 20
        if units_by_status.get("EXPIRED", 0) > 20:
            health_score -= 15
        if units_by_status.get("EXPIRED", 0) + units_by_status.get("DISCARDED", 0) > total_units * 0.1:
            health_score -= 10

        critical_alerts = self.db.query(SystemAlert).filter(
            SystemAlert.severity == "CRITICAL",
            SystemAlert.status == "ACTIVE",
        ).count()

        high_alerts = self.db.query(SystemAlert).filter(
            SystemAlert.severity == "HIGH",
            SystemAlert.status == "ACTIVE",
        ).count()

        snapshot = AdminDashboardSnapshot(
            total_hospitals=total_hospitals,
            active_hospitals=active_hospitals,
            total_blood_units=total_units,
            units_by_status=units_by_status,
            units_by_blood_group=units_by_blood_group,
            total_requests_today=total_requests,
            total_transfers_today=total_transfers,
            total_alerts_today=active_alerts,
            system_health_score=max(0, health_score),
            critical_alerts=critical_alerts,
            high_alerts=high_alerts,
        )
        self.db.add(snapshot)
        self.db.commit()

        return AdminDashboardSnapshotOut.model_validate(snapshot)

    def get_admin_dashboard(self) -> AdminDashboardOut:
        """Get complete admin dashboard with all critical information."""
        snapshot = self.generate_dashboard_snapshot()
        pending = self.get_pending_approvals()
        alerts = self.get_active_alerts()
        logs = self.get_audit_logs(limit=20)

        return AdminDashboardOut(
            current_snapshot=snapshot,
            pending_approvals=pending,
            active_system_alerts=alerts,
            recent_audit_logs=logs,
        )


def get_admin_service(db: Session) -> AdminPortalService:
    """Factory function."""
    return AdminPortalService(db)
