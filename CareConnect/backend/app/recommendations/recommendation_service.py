"""
Module 5: Recommendation Engine Service

Generates smart recommendations based on:
- Module 3: Demand forecasts
- Module 4: Shortage predictions
- Current inventory levels
"""

import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.blood_request import BloodRequest
from app.models.blood_inventory import BloodUnit
from app.recommendations.models import Recommendation, DonorCampaign
from app.recommendations.schemas import (
    RecommendationOut,
    DonorCampaignOut,
    RecommendationSummaryOut,
)

logger = logging.getLogger(__name__)


class RecommendationService:
    """Generates actionable recommendations for blood management."""

    def __init__(self, db: Session):
        self.db = db

    def generate_recommendations(self, hospital_id: int) -> RecommendationSummaryOut:
        """
        Generate comprehensive recommendations for blood management.

        Analyzes:
        - Demand forecasts (Module 3)
        - Current inventory (Module 1/2)
        - Shortage risks (Module 4)

        Returns: Recommendations organized by type and priority
        """
        logger.info(f"Generating recommendations for hospital {hospital_id}")

        BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
        recommendations = []
        priority_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        type_counts = {}

        for blood_group in BLOOD_GROUPS:
            current_stock = self._get_current_stock(hospital_id, blood_group)
            forecasted_demand = self._get_forecasted_demand(hospital_id, blood_group, 7)
            
            # Determine if action needed
            if current_stock < forecasted_demand:
                gap = forecasted_demand - current_stock
                priority = self._calculate_priority(gap, forecasted_demand)
                
                rec = self._create_donor_campaign_recommendation(
                    hospital_id, blood_group, gap, priority
                )
                recommendations.append(rec)
                
                priority_counts[priority] += 1
                type_counts["DONOR_CAMPAIGN"] = type_counts.get("DONOR_CAMPAIGN", 0) + 1
                self.db.add(rec)
            
            # Check for expiry risk
            expiring_soon = self.db.query(BloodUnit).filter(
                BloodUnit.hospital_id == hospital_id,
                BloodUnit.blood_group == blood_group,
                BloodUnit.expiry_date <= datetime.utcnow().date() + timedelta(days=7),
            ).count()
            
            if expiring_soon > 5:
                rec = self._create_defer_procedures_recommendation(
                    hospital_id, blood_group, expiring_soon
                )
                recommendations.append(rec)
                priority_counts["MEDIUM"] += 1
                type_counts["DEFER_PROCEDURES"] = type_counts.get("DEFER_PROCEDURES", 0) + 1
                self.db.add(rec)

        self.db.commit()

        # Get active campaigns
        campaigns = self.db.query(DonorCampaign).filter(
            DonorCampaign.hospital_id == hospital_id,
            DonorCampaign.status == "ACTIVE",
        ).all()
        campaign_outs = [DonorCampaignOut.model_validate(c) for c in campaigns]

        # Build response
        result = RecommendationSummaryOut(
            hospital_id=hospital_id,
            generated_at=datetime.utcnow(),
            total_recommendations=len(recommendations),
            by_priority=priority_counts,
            by_type=type_counts,
            active_recommendations=[
                RecommendationOut.model_validate(r) for r in recommendations
            ],
            active_campaigns=campaign_outs,
        )

        logger.info(f"Generated {len(recommendations)} recommendations for hospital {hospital_id}")
        return result

    def _get_current_stock(self, hospital_id: int, blood_group: str) -> int:
        """Get available + reserved inventory."""
        return self.db.query(BloodUnit).filter(
            BloodUnit.hospital_id == hospital_id,
            BloodUnit.blood_group == blood_group,
            BloodUnit.status.in_(["AVAILABLE", "RESERVED"]),
        ).count()

    def _get_forecasted_demand(self, hospital_id: int, blood_group: str, days: int) -> int:
        """Get forecasted demand for next N days."""
        cutoff = datetime.utcnow().date() - timedelta(days=90)
        requests = self.db.query(BloodRequest).filter(
            BloodRequest.hospital_id == hospital_id,
            BloodRequest.blood_group == blood_group,
            BloodRequest.created_at >= cutoff,
        ).count()
        
        avg_daily = max(1, requests / 90) if requests > 0 else 2
        return int(avg_daily * days)

    def _calculate_priority(self, gap: int, forecast: int) -> str:
        """Calculate recommendation priority based on gap size."""
        if gap > forecast:
            return "CRITICAL"
        elif gap > forecast * 0.5:
            return "HIGH"
        elif gap > forecast * 0.2:
            return "MEDIUM"
        else:
            return "LOW"

    def _create_donor_campaign_recommendation(
        self, hospital_id: int, blood_group: str, units_needed: int, priority: str
    ) -> Recommendation:
        """Create recommendation to launch donor campaign."""
        return Recommendation(
            hospital_id=hospital_id,
            rec_type="DONOR_CAMPAIGN",
            blood_group=blood_group,
            priority=priority,
            title=f"Launch {blood_group} donor campaign",
            description=f"Current {blood_group} inventory critically low. Need {units_needed} units in next 7 days.",
            action_by_date=datetime.utcnow() + timedelta(days=2),
            estimated_units_needed=units_needed,
            impact_score=85.0,
        )

    def _create_defer_procedures_recommendation(
        self, hospital_id: int, blood_group: str, expiring_units: int
    ) -> Recommendation:
        """Create recommendation to use expiring inventory."""
        return Recommendation(
            hospital_id=hospital_id,
            rec_type="DEFER_PROCEDURES",
            blood_group=blood_group,
            priority="MEDIUM",
            title=f"Use expiring {blood_group} units",
            description=f"{expiring_units} units of {blood_group} expire within 7 days. Schedule procedures to use these units.",
            action_by_date=datetime.utcnow() + timedelta(days=5),
            estimated_units_needed=expiring_units,
            impact_score=70.0,
        )

    def update_recommendation(self, rec_id: int, status: str, notes: str | None = None) -> RecommendationOut:
        """Update recommendation status."""
        rec = self.db.query(Recommendation).filter_by(id=rec_id).first()
        if not rec:
            raise ValueError(f"Recommendation {rec_id} not found")

        rec.status = status
        if status == "COMPLETED":
            rec.completed_at = datetime.utcnow()
        if notes:
            rec.description += f"\n[Update: {notes}]"

        self.db.commit()
        logger.info(f"Updated recommendation {rec_id} to {status}")
        return RecommendationOut.model_validate(rec)

    def start_campaign(
        self, hospital_id: int, blood_group: str, campaign_name: str, target_units: int
    ) -> DonorCampaignOut:
        """Start a new donor campaign."""
        campaign = DonorCampaign(
            hospital_id=hospital_id,
            campaign_name=campaign_name,
            blood_group_target=blood_group,
            target_units=target_units,
        )
        self.db.add(campaign)
        self.db.commit()
        logger.info(f"Started campaign '{campaign_name}' for {blood_group}")
        return DonorCampaignOut.model_validate(campaign)

    def update_campaign(self, campaign_id: int, units_collected: int | None = None, status: str | None = None) -> DonorCampaignOut:
        """Update campaign progress."""
        campaign = self.db.query(DonorCampaign).filter_by(id=campaign_id).first()
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")

        if units_collected is not None:
            campaign.units_collected = units_collected
        if status:
            campaign.status = status
            if status == "COMPLETED":
                campaign.end_date = datetime.utcnow()

        self.db.commit()
        return DonorCampaignOut.model_validate(campaign)


def get_recommendation_service(db: Session) -> RecommendationService:
    """Factory function."""
    return RecommendationService(db)
