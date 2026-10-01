"""
Module 7: Blood Expiry Management Service

Monitors expiring blood, generates FIFO recommendations, and tracks wastage.
Integrates with Module 1's scan_and_expire_units logic.
"""

import logging
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.blood_inventory import BloodUnit
from app.blood_expiry.models import ExpiryAlert, FIFOUsageLog, ExpiryReport
from app.blood_expiry.schemas import (
    ExpiryAlertOut,
    FIFORecommendationOut,
    ExpiryDashboardOut,
    ExpiryReportOut,
)

logger = logging.getLogger(__name__)


class BloodExpiryService:
    """Manages blood expiry alerts and FIFO usage optimization."""

    def __init__(self, db: Session):
        self.db = db

    def scan_and_alert_expiry(self, hospital_id: int) -> ExpiryDashboardOut:
        """
        Scan all blood units and generate expiry alerts.

        Integrates with Module 1's expiry detection:
        - Units expiring in 7+ days: WARNING
        - Units expiring in 1-7 days: URGENT
        - Units past expiry: EXPIRED (mark as EXPIRED in inventory)

        Args:
            hospital_id: Target hospital

        Returns:
            ExpiryDashboardOut with alerts and FIFO recommendations
        """
        logger.info(f"Scanning expiry for hospital {hospital_id}")

        today = datetime.utcnow().date()
        all_units = self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id
        ).all()

        alerts = []
        fifo_recs = {}  # blood_group -> [units ordered by expiry]
        expired_count = 0
        urgent_count = 0
        warning_count = 0

        for unit in all_units:
            if not unit.expiry_date:
                continue

            days_left = (unit.expiry_date - today).days

            # Determine alert level
            if days_left < 0:
                alert_level = "EXPIRED"
                recommended_action = "DISCARD"
                expired_count += 1

                # Mark as EXPIRED in inventory if not already
                if unit.status not in ["EXPIRED", "DISCARDED"]:
                    unit.status = "EXPIRED"

            elif days_left <= 7:
                alert_level = "URGENT"
                recommended_action = "USE_IMMEDIATELY"
                urgent_count += 1

            elif days_left <= 30:
                alert_level = "WARNING"
                recommended_action = "DEFER_PROCEDURE"
                warning_count += 1

            else:
                alert_level = None

            # Create alert if needed
            if alert_level:
                alert = ExpiryAlert(
                    hospital_id=hospital_id,
                    blood_unit_id=unit.id,
                    blood_group=unit.blood_group,
                    unit_code=unit.unit_code,
                    expiry_date=unit.expiry_date,
                    days_until_expiry=days_left,
                    alert_level=alert_level,
                    recommended_action=recommended_action,
                )
                self.db.add(alert)
                alerts.append(alert)

            # Track for FIFO recommendations
            if unit.status in ["AVAILABLE", "RESERVED"]:
                if unit.blood_group not in fifo_recs:
                    fifo_recs[unit.blood_group] = []
                fifo_recs[unit.blood_group].append(unit)

        self.db.commit()

        # Sort by expiry to get FIFO order
        fifo_recommendations = []
        for blood_group, units in fifo_recs.items():
            units_sorted = sorted(units, key=lambda u: u.expiry_date or datetime.max)
            if units_sorted:
                first_unit = units_sorted[0]
                fifo_recommendations.append(
                    FIFORecommendationOut(
                        blood_group=blood_group,
                        recommended_unit_code=first_unit.unit_code,
                        expiry_date=first_unit.expiry_date,
                        reason="Earliest expiry - use next per FIFO protocol",
                    )
                )

        # Calculate totals
        total_in_stock = self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id,
            BloodUnit.status.in_(["AVAILABLE", "RESERVED"]),
        ).count()

        alert_outs = [ExpiryAlertOut.model_validate(a) for a in alerts]

        result = ExpiryDashboardOut(
            hospital_id=hospital_id,
            scan_date=datetime.utcnow(),
            total_units_in_stock=total_in_stock,
            expiring_breakdown={
                "EXPIRED": expired_count,
                "URGENT": urgent_count,
                "WARNING": warning_count,
            },
            active_alerts=alert_outs,
            fifo_recommendations=fifo_recommendations,
            estimated_wastage_units=expired_count,
            estimated_wastage_cost=expired_count * 300,  # Rough estimate: 300 per unit
        )

        logger.info(f"Expiry scan complete: {expired_count} expired, {urgent_count} urgent")
        return result

    def get_fifo_recommendation(self, hospital_id: int, blood_group: str) -> FIFORecommendationOut | None:
        """Get FIFO recommendation for a specific blood group."""
        units = self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id,
            BloodUnit.blood_group == blood_group,
            BloodUnit.status.in_(["AVAILABLE", "RESERVED"]),
        ).order_by(BloodUnit.expiry_date.asc()).first()

        if not units:
            return None

        return FIFORecommendationOut(
            blood_group=blood_group,
            recommended_unit_code=units.unit_code,
            expiry_date=units.expiry_date,
            reason="Earliest expiry - use next per FIFO protocol",
        )

    def log_fifo_usage(
        self,
        hospital_id: int,
        blood_group: str,
        recommended_unit_id: int,
        actually_used_unit_id: int,
        notes: str | None = None,
    ) -> None:
        """
        Log whether hospital followed FIFO recommendation.

        Args:
            hospital_id: Hospital
            blood_group: Blood group used
            recommended_unit_id: Unit we recommended
            actually_used_unit_id: Unit they actually used
            notes: Optional notes
        """
        recommended_unit = self.db.query(BloodUnit).filter_by(id=recommended_unit_id).first()
        actually_used = self.db.query(BloodUnit).filter_by(id=actually_used_unit_id).first()

        complied = recommended_unit_id == actually_used_unit_id

        log = FIFOUsageLog(
            hospital_id=hospital_id,
            blood_group=blood_group,
            recommended_unit_id=recommended_unit_id,
            recommended_unit_code=recommended_unit.unit_code if recommended_unit else None,
            recommended_expiry=recommended_unit.expiry_date if recommended_unit else None,
            actually_used_unit_id=actually_used_unit_id,
            actually_used_unit_code=actually_used.unit_code if actually_used else None,
            usage_date=datetime.utcnow(),
            complied_with_fifo=complied,
            notes=notes,
        )
        self.db.add(log)
        self.db.commit()

        if not complied:
            logger.warning(
                f"FIFO non-compliance: recommended {recommended_unit.unit_code}, used {actually_used.unit_code}"
            )

    def dismiss_alert(self, alert_id: int, reason: str | None = None) -> ExpiryAlertOut:
        """Dismiss an expiry alert."""
        alert = self.db.query(ExpiryAlert).filter_by(id=alert_id).first()
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")

        alert.alert_status = "DISMISSED"
        alert.resolved_at = datetime.utcnow()
        self.db.commit()

        logger.info(f"Alert {alert_id} dismissed")
        return ExpiryAlertOut.model_validate(alert)

    def generate_expiry_report(self, hospital_id: int, report_period: str) -> ExpiryReportOut:
        """
        Generate monthly expiry wastage report.

        Args:
            hospital_id: Hospital
            report_period: "2026-08" format

        Returns:
            ExpiryReportOut with wastage analysis
        """
        year, month = map(int, report_period.split("-"))
        period_start = datetime(year, month, 1).date()
        if month == 12:
            period_end = datetime(year + 1, 1, 1).date()
        else:
            period_end = datetime(year, month + 1, 1).date()

        # Count expired/discarded units in period
        expired = self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id,
            BloodUnit.status == "EXPIRED",
            BloodUnit.created_at >= period_start,
            BloodUnit.created_at < period_end,
        ).all()

        discarded = self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id,
            BloodUnit.status == "DISCARDED",
            BloodUnit.created_at >= period_start,
            BloodUnit.created_at < period_end,
        ).all()

        # Count by blood group
        by_group = {}
        for unit in expired + discarded:
            by_group[unit.blood_group] = by_group.get(unit.blood_group, 0) + 1

        # Calculate FIFO compliance
        total_uses = self.db.query(FIFOUsageLog).filter(
            FIFOUsageLog.hospital_id == hospital_id,
            FIFOUsageLog.usage_date >= period_start,
            FIFOUsageLog.usage_date < period_end,
        ).count()

        compliant_uses = self.db.query(FIFOUsageLog).filter(
            FIFOUsageLog.hospital_id == hospital_id,
            FIFOUsageLog.complied_with_fifo == True,
            FIFOUsageLog.usage_date >= period_start,
            FIFOUsageLog.usage_date < period_end,
        ).count()

        fifo_compliance = int((compliant_uses / max(1, total_uses)) * 100)

        # Generate recommendations
        recommendations = ""
        if len(expired) + len(discarded) > 10:
            recommendations += "• Implement stricter FIFO protocol enforcement\n"
        if fifo_compliance < 80:
            recommendations += "• Improve FIFO compliance (currently below 80%)\n"
        if "O+" in by_group and by_group["O+"] > 5:
            recommendations += "• Consider reducing O+ procurement or adjusting demand forecasting\n"

        report = ExpiryReport(
            hospital_id=hospital_id,
            report_period=report_period,
            total_units_expired=len(expired),
            total_units_discarded=len(discarded),
            total_wastage=len(expired) + len(discarded),
            by_blood_group=json.dumps(by_group),
            fifo_compliance_percent=fifo_compliance,
            recommendations=recommendations if recommendations else None,
        )
        self.db.add(report)
        self.db.commit()

        logger.info(f"Expiry report generated for {hospital_id}: {report.total_wastage} units wasted")
        return ExpiryReportOut.model_validate(report)


def get_expiry_service(db: Session) -> BloodExpiryService:
    """Factory function."""
    return BloodExpiryService(db)
