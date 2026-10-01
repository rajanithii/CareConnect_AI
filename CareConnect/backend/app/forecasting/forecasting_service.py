"""
Forecasting service layer.

Orchestrates:
- Database queries for historical request data
- Groq LLM analyzer calls
- Validation and error handling
- Response transformation to API schemas
"""

import logging
from datetime import datetime, timedelta
from os import getenv

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.blood_request import BloodRequest
from app.models.hospital import Hospital
from app.models.blood_inventory import BloodUnit
from app.forecasting.demand_analyzer import get_demand_analyzer
from app.forecasting.schemas import (
    DemandForecastOut,
    FestivalForecastOut,
    PeakAnalysisOut,
    SeasonalAnalysisOut,
    DailyForecastOut,
    WeeklyForecastOut,
    FestivalForecastItemOut,
    PeakDayOut,
    PeakBloodGroupOut,
    MonthSeasonalOut,
)

logger = logging.getLogger(__name__)


class ForecastingService:
    """Orchestrates demand forecasting pipeline."""

    def __init__(self, db: Session):
        self.db = db
        self.groq_api_key = getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        self.analyzer = get_demand_analyzer(self.groq_api_key)

    def _get_request_history(
        self,
        hospital_id: int,
        days_lookback: int = 90,
    ) -> list[dict]:
        """
        Fetch historical blood requests for a hospital.

        Args:
            hospital_id: Hospital ID
            days_lookback: Number of days of history to retrieve

        Returns:
            List of request dicts formatted for LLM
        """
        cutoff_date = datetime.utcnow().date() - timedelta(days=days_lookback)

        requests = self.db.query(BloodRequest).filter(
            BloodRequest.hospital_id == hospital_id,
            BloodRequest.created_at >= cutoff_date,
        ).all()

        if not requests:
            # Try matching requests by hospital name
            hosp = self.db.query(Hospital).filter(Hospital.id == hospital_id).first()
            if hosp and hosp.name:
                requests = self.db.query(BloodRequest).filter(
                    BloodRequest.hospital.ilike(f"%{hosp.name}%"),
                    BloodRequest.created_at >= cutoff_date,
                ).all()

        if not requests:
            # Fall back to all recent blood requests across system for baseline forecasting
            requests = self.db.query(BloodRequest).filter(
                BloodRequest.created_at >= cutoff_date,
            ).all()

        if not requests:
            # Fall back to all historical blood requests
            requests = self.db.query(BloodRequest).limit(50).all()

        if not requests:
            logger.warning(f"No request history found for hospital {hospital_id} in last {days_lookback} days")
            return []

        formatted = [
            {
                "date": r.created_at.date().isoformat() if r.created_at else None,
                "blood_group": r.blood_group,
                "quantity": 1,
                "urgency": r.urgency or "NORMAL",
                "status": r.status,
            }
            for r in requests
        ]

        logger.info(f"Retrieved {len(formatted)} historical requests for hospital {hospital_id}")
        return formatted

    def forecast_demand(
        self,
        hospital_id: int,
        days_ahead: int = 30,
        include_recommendations: bool = True,
    ) -> DemandForecastOut:
        """
        Generate demand forecast for a hospital.

        Args:
            hospital_id: Hospital ID
            days_ahead: Number of days to forecast
            include_recommendations: Include operational recommendations

        Returns:
            Forecast with daily/weekly predictions, trend, recommendations

        Raises:
            ValueError: If insufficient historical data
            RuntimeError: If LLM call fails
        """
        logger.info(f"Starting demand forecast for hospital {hospital_id}, {days_ahead} days")

        # Get historical data
        history = self._get_request_history(hospital_id, days_lookback=90)
        if not history:
            raise ValueError(f"Insufficient historical data for hospital {hospital_id}")

        # Call analyzer
        try:
            forecast = self.analyzer.forecast_demand(history)
        except Exception as e:
            logger.error(f"Forecast generation failed: {e}")
            raise

        # Transform to schema
        daily = [
            DailyForecastOut(
                date=d["date"],
                predicted_units=d["predicted_units"],
                confidence=d["confidence"],
                primary_blood_groups=d.get("primary_blood_groups"),
                urgency_split=d.get("urgency_split"),
            )
            for d in forecast.get("daily_forecasts", [])
        ]

        weekly = [
            WeeklyForecastOut(
                week_start=w["week_start"],
                total_predicted_units=w["total_predicted_units"],
                confidence=w["confidence"],
            )
            for w in forecast.get("weekly_summary", [])
        ]

        result = DemandForecastOut(
            hospital_id=hospital_id,
            forecast_generated_at=datetime.utcnow(),
            forecast_period_days=forecast.get("forecast_period_days", days_ahead),
            daily_forecasts=daily,
            weekly_summary=weekly,
            trend=forecast.get("trend", "stable"),
            trend_confidence=forecast.get("trend_confidence", 50),
            peak_days=forecast.get("peak_days", []),
            seasonal_factors=forecast.get("seasonal_factors", []),
            anomalies_detected=forecast.get("anomalies_detected"),
            recommendations=forecast.get("recommendations", []) if include_recommendations else [],
        )

        logger.info(f"Demand forecast completed for hospital {hospital_id}")
        return result

    def forecast_festival_impact(
        self,
        hospital_id: int,
        events: list[dict],
    ) -> FestivalForecastOut:
        """
        Predict demand impact during festivals/events.

        Args:
            hospital_id: Hospital ID
            events: List of {event_name, event_date, event_type} dicts

        Returns:
            Festival forecast with demand projections per event

        Raises:
            ValueError: If input validation fails
            RuntimeError: If LLM call fails
        """
        if not events:
            raise ValueError("At least one event required")

        logger.info(f"Starting festival forecast for hospital {hospital_id}, {len(events)} events")

        history = self._get_request_history(hospital_id, days_lookback=180)
        if not history:
            raise ValueError(f"Insufficient historical data for hospital {hospital_id}")

        # Get hospital location (from hospital table, assuming it exists)
        hospital = self.db.query(BloodRequest).filter_by(hospital_id=hospital_id).first()
        location = "India"  # Default, would normally come from hospital table

        try:
            forecast = self.analyzer.analyze_festival_impact(history, location, events)
        except Exception as e:
            logger.error(f"Festival forecast generation failed: {e}")
            raise

        # Transform to schema
        festival_items = [
            FestivalForecastItemOut(
                event_name=f["event_name"],
                event_date=f["event_date"],
                predicted_demand_increase_percent=f["predicted_demand_increase_percent"],
                predicted_total_units=f.get("predicted_total_units", 0),
                confidence=f["confidence"],
                primary_blood_groups_needed=f.get("primary_blood_groups_needed", []),
                urgency_expected=f.get("urgency_expected", "HIGH"),
                preparation_days_needed=f.get("preparation_days_needed", 7),
                notes=f.get("notes"),
            )
            for f in forecast.get("festival_forecasts", [])
        ]

        result = FestivalForecastOut(
            hospital_id=hospital_id,
            generated_at=datetime.utcnow(),
            festival_forecasts=festival_items,
            overall_assessment=forecast.get("overall_assessment", "moderate_increase"),
        )

        logger.info(f"Festival forecast completed for hospital {hospital_id}")
        return result

    def analyze_peak_patterns(
        self,
        hospital_id: int,
        days_lookback: int = 90,
    ) -> PeakAnalysisOut:
        """
        Analyze peak demand patterns (days, blood groups, urgencies).

        Args:
            hospital_id: Hospital ID
            days_lookback: Historical days to analyze

        Returns:
            Peak analysis with rankings and insights

        Raises:
            ValueError: If insufficient data
            RuntimeError: If LLM call fails
        """
        logger.info(f"Starting peak analysis for hospital {hospital_id}")

        history = self._get_request_history(hospital_id, days_lookback)
        if not history:
            raise ValueError(f"Insufficient historical data for hospital {hospital_id}")

        try:
            analysis = self.analyzer.analyze_peak_patterns(history)
        except Exception as e:
            logger.error(f"Peak analysis failed: {e}")
            raise

        # Transform to schema
        peak_days = [
            PeakDayOut(
                day=d["day"],
                avg_requests=d.get("avg_requests", 0),
                avg_units=d.get("avg_units", 0),
                rank=d.get("rank", 999),
            )
            for d in analysis.get("peak_days_of_week", [])
        ]

        peak_groups = [
            PeakBloodGroupOut(
                blood_group=g["blood_group"],
                request_frequency_percent=g.get("request_frequency_percent", 0),
                total_units_requested=g.get("total_units_requested", 0),
                rank=g.get("rank", 999),
            )
            for g in analysis.get("peak_blood_groups", [])
        ]

        result = PeakAnalysisOut(
            hospital_id=hospital_id,
            generated_at=datetime.utcnow(),
            peak_days_of_week=peak_days,
            peak_blood_groups=peak_groups,
            peak_urgency_distribution=analysis.get("peak_urgency_distribution", {}),
            peak_hour=analysis.get("peak_hour"),
            data_quality_score=analysis.get("data_quality_score", 75),
            insights=analysis.get("insights", []),
        )

        logger.info(f"Peak analysis completed for hospital {hospital_id}")
        return result

    def analyze_seasonal_patterns(
        self,
        hospital_id: int,
        months_lookback: int = 12,
    ) -> SeasonalAnalysisOut:
        """
        Analyze seasonal demand patterns.

        Args:
            hospital_id: Hospital ID
            months_lookback: Historical months to analyze

        Returns:
            Seasonal analysis with monthly breakdown

        Raises:
            ValueError: If insufficient data
            RuntimeError: If LLM call fails
        """
        logger.info(f"Starting seasonal analysis for hospital {hospital_id}")

        days = months_lookback * 30
        history = self._get_request_history(hospital_id, days)
        if not history:
            raise ValueError(f"Insufficient historical data for hospital {hospital_id}")

        try:
            analysis = self.analyzer.analyze_seasonal_patterns(history)
        except Exception as e:
            logger.error(f"Seasonal analysis failed: {e}")
            raise

        # Transform to schema
        months = [
            MonthSeasonalOut(
                month=m["month"],
                demand_level=m.get("demand_level", "medium"),
                avg_requests=m.get("avg_requests", 0),
                avg_units=m.get("avg_units", 0),
                variance=m.get("variance", 0),
                primary_blood_groups=m.get("primary_blood_groups", []),
                notes=m.get("notes"),
            )
            for m in analysis.get("months", [])
        ]

        result = SeasonalAnalysisOut(
            hospital_id=hospital_id,
            generated_at=datetime.utcnow(),
            months=months,
            peak_season=analysis.get("peak_season", {}),
            low_season=analysis.get("low_season", {}),
            seasonal_recommendations=analysis.get("seasonal_recommendations", []),
        )

        logger.info(f"Seasonal analysis completed for hospital {hospital_id}")
        return result


def get_forecasting_service(db: Session) -> ForecastingService:
    """Factory function for ForecastingService."""
    return ForecastingService(db)
