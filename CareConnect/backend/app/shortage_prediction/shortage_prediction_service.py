"""
Module 4: Blood Shortage Prediction Service

Compares forecasted demand (Module 3) vs current inventory (Module 1/2)
to predict shortages and generate risk alerts.
"""

import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.blood_inventory import BloodUnit
from app.shortage_prediction.models import ShortageAlert, RiskAssessment
from app.shortage_prediction.schemas import (
    ShortageAlertOut,
    RiskAssessmentOut,
    ShortageSummaryOut,
)

logger = logging.getLogger(__name__)


class ShortagesPredictionService:
    """Predicts blood shortages by comparing inventory vs forecasts."""

    def __init__(self, db: Session):
        self.db = db

    def _get_current_stock(self, hospital_id: int, blood_group: str) -> int:
        """Get available + reserved inventory for a blood group."""
        count = self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id,
            BloodUnit.blood_group == blood_group,
            BloodUnit.status.in_(["AVAILABLE", "RESERVED"]),
        ).count()
        return count

    def _get_forecasted_demand(self, hospital_id: int, blood_group: str, days: int) -> int:
        """
        Get forecasted demand for blood group over next N days.
        For now, uses historical average if Module 3 data unavailable.
        """
        from app.models.blood_request import BloodRequest
        
        cutoff = datetime.utcnow().date() - timedelta(days=90)
        requests = self.db.query(BloodRequest).filter(
            BloodRequest.hospital_id == hospital_id,
            BloodRequest.blood_group == blood_group,
            BloodRequest.created_at >= cutoff,
        ).count()
        
        # Average per day * days_ahead
        avg_daily = max(1, requests / 90) if requests > 0 else 2
        return int(avg_daily * days)

    def _calculate_risk_level(self, stock: int, forecast: int) -> str:
        """
        Determine risk level based on coverage.
        CRITICAL: <1 day coverage
        HIGH: 1-3 days
        MEDIUM: 3-7 days
        LOW: >7 days
        """
        if stock == 0:
            return "CRITICAL"
        
        days_left = stock / max(1, forecast / 7)
        
        if days_left < 1:
            return "CRITICAL"
        elif days_left < 3:
            return "HIGH"
        elif days_left < 7:
            return "MEDIUM"
        else:
            return "LOW"

    def predict_shortages(
        self,
        hospital_id: int,
        days_ahead: int = 7,
    ) -> ShortageSummaryOut:
        """
        Analyze shortage risk across all blood groups.

        Args:
            hospital_id: Target hospital
            days_ahead: Days to forecast (1-30)

        Returns:
            Shortage summary with alerts and risk assessment
        """
        logger.info(f"Predicting shortages for hospital {hospital_id}, {days_ahead} days")

        BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
        
        alerts = []
        risk_levels = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        critical_groups = []
        total_coverage_days = 0

        for blood_group in BLOOD_GROUPS:
            stock = self._get_current_stock(hospital_id, blood_group)
            forecast = self._get_forecasted_demand(hospital_id, blood_group, days_ahead)
            risk = self._calculate_risk_level(stock, forecast)
            
            risk_levels[risk] += 1

            # Create alert if not LOW risk
            if risk in ["CRITICAL", "HIGH", "MEDIUM"]:
                days_left = stock / max(1, forecast / days_ahead) if forecast > 0 else None
                
                recommended = int(forecast * 1.2)  # 20% safety buffer
                
                alert = ShortageAlert(
                    hospital_id=hospital_id,
                    blood_group=blood_group,
                    current_stock=stock,
                    forecasted_demand_7days=forecast,
                    risk_level=risk,
                    days_until_stockout=int(days_left) if days_left else None,
                    recommended_stock=recommended,
                    alert_status="ACTIVE",
                )
                
                self.db.add(alert)
                alerts.append(alert)
                
                if risk == "CRITICAL":
                    critical_groups.append(blood_group)
            
            if forecast > 0:
                coverage = stock / forecast * days_ahead
                total_coverage_days += coverage

        self.db.commit()

        # Calculate overall risk
        if risk_levels["CRITICAL"] > 0:
            overall_risk = "CRITICAL"
        elif risk_levels["HIGH"] > 2:
            overall_risk = "HIGH"
        elif risk_levels["HIGH"] + risk_levels["MEDIUM"] > 4:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        # Create risk assessment
        assessment = RiskAssessment(
            hospital_id=hospital_id,
            overall_risk=overall_risk,
            critical_blood_groups=",".join(critical_groups) if critical_groups else None,
            total_alerts=len(alerts),
            critical_alerts=risk_levels["CRITICAL"],
            high_alerts=risk_levels["HIGH"],
            stock_coverage_days=total_coverage_days / len(BLOOD_GROUPS) if BLOOD_GROUPS else 0,
        )
        self.db.add(assessment)
        self.db.commit()

        # Generate recommendations
        recommendations = self._generate_recommendations(
            hospital_id, alerts, overall_risk, critical_groups
        )

        # Build response
        alert_outs = [
            ShortageAlertOut.model_validate(a) for a in alerts
        ]
        
        risk_out = RiskAssessmentOut.model_validate(assessment)

        result = ShortageSummaryOut(
            hospital_id=hospital_id,
            analysis_date=datetime.utcnow(),
            active_alerts=alert_outs,
            risk_assessment=risk_out,
            recommendations=recommendations,
        )

        logger.info(f"Shortage prediction completed: {overall_risk} risk for hospital {hospital_id}")
        return result

    def _generate_recommendations(
        self,
        hospital_id: int,
        alerts: list[ShortageAlert],
        overall_risk: str,
        critical_groups: list[str],
    ) -> list[str]:
        """Generate actionable recommendations based on shortage analysis."""
        recs = []

        if overall_risk == "CRITICAL":
            recs.append("🚨 CRITICAL: Activate emergency donor outreach immediately")
            recs.append("Contact blood banks for emergency transfers")
            recs.append("Defer non-critical procedures")

        if critical_groups:
            recs.append(f"Urgent: Procure {', '.join(critical_groups)} blood groups")

        for alert in alerts:
            if alert.risk_level == "HIGH":
                recs.append(
                    f"Schedule campaigns for {alert.blood_group}+ donors within 48 hours"
                )
            elif alert.risk_level == "MEDIUM":
                recs.append(f"Monitor {alert.blood_group} inventory closely")

        if not recs:
            recs.append("✅ All blood group levels healthy. Continue routine operations.")

        return recs

    def resolve_alert(self, alert_id: int, notes: str | None = None) -> ShortageAlertOut:
        """Mark alert as resolved."""
        alert = self.db.query(ShortageAlert).filter_by(id=alert_id).first()
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")

        alert.alert_status = "RESOLVED"
        alert.resolved_at = datetime.utcnow()
        if notes:
            alert.notes = notes

        self.db.commit()
        logger.info(f"Alert {alert_id} resolved")
        return ShortageAlertOut.model_validate(alert)

    def get_active_alerts(self, hospital_id: int) -> list[ShortageAlertOut]:
        """Get all active shortage alerts for hospital."""
        alerts = self.db.query(ShortageAlert).filter(
            ShortageAlert.hospital_id == hospital_id,
            ShortageAlert.alert_status == "ACTIVE",
        ).all()
        return [ShortageAlertOut.model_validate(a) for a in alerts]


def get_shortage_service(db: Session) -> ShortagesPredictionService:
    """Factory function."""
    return ShortagesPredictionService(db)
