"""
Validators for AI demand forecasting responses.

Ensures Groq LLM output conforms to expected schemas.
Follows app/ai/validators.py pattern — strict type checking, clear errors.
"""

import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def validate_demand_forecast(data: dict) -> dict:
    """
    Validate 30-day demand forecast structure.

    Args:
        data: Raw response from Groq

    Returns:
        Validated forecast dict

    Raises:
        ValueError: If structure or content is invalid
    """
    if not isinstance(data, dict):
        raise ValueError("Forecast must be a dictionary")

    # Required top-level fields
    required = ["daily_forecasts", "trend", "recommendations"]
    for field in required:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")

    # Validate daily_forecasts
    if not isinstance(data["daily_forecasts"], list):
        raise ValueError("daily_forecasts must be a list")

    if len(data["daily_forecasts"]) == 0:
        raise ValueError("daily_forecasts cannot be empty")

    for i, forecast in enumerate(data["daily_forecasts"]):
        if not isinstance(forecast, dict):
            raise ValueError(f"daily_forecasts[{i}] must be a dictionary")

        # Validate each daily forecast
        required_fields = ["date", "predicted_units", "confidence"]
        for field in required_fields:
            if field not in forecast:
                raise ValueError(f"daily_forecasts[{i}] missing required field: {field}")

        # Type checks
        if not isinstance(forecast["date"], str):
            raise ValueError(f"daily_forecasts[{i}].date must be a string (YYYY-MM-DD)")

        if not isinstance(forecast["predicted_units"], int) or forecast["predicted_units"] < 0:
            raise ValueError(f"daily_forecasts[{i}].predicted_units must be non-negative int")

        if not isinstance(forecast["confidence"], (int, float)) or not (0 <= forecast["confidence"] <= 100):
            raise ValueError(f"daily_forecasts[{i}].confidence must be 0-100")

        # Validate date format
        try:
            datetime.strptime(forecast["date"], "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"daily_forecasts[{i}].date has invalid format (expected YYYY-MM-DD)")

    # Validate trend
    valid_trends = ["increasing", "stable", "decreasing"]
    if data["trend"] not in valid_trends:
        raise ValueError(f"trend must be one of {valid_trends}")

    # Validate recommendations
    if not isinstance(data["recommendations"], list):
        raise ValueError("recommendations must be a list")

    logger.info("Demand forecast validation passed")
    return data


def validate_festival_forecast(data: dict) -> dict:
    """
    Validate festival impact forecast.

    Args:
        data: Raw response from Groq

    Returns:
        Validated forecast dict

    Raises:
        ValueError: If structure is invalid
    """
    if not isinstance(data, dict):
        raise ValueError("Festival forecast must be a dictionary")

    if "festival_forecasts" not in data:
        raise ValueError("Missing required field: festival_forecasts")

    if not isinstance(data["festival_forecasts"], list):
        raise ValueError("festival_forecasts must be a list")

    valid_assessments = ["major_spike", "moderate_increase", "minor_increase", "normal"]

    for i, festival in enumerate(data["festival_forecasts"]):
        if not isinstance(festival, dict):
            raise ValueError(f"festival_forecasts[{i}] must be a dictionary")

        required = ["event_name", "event_date", "predicted_demand_increase_percent", "confidence"]
        for field in required:
            if field not in festival:
                raise ValueError(f"festival_forecasts[{i}] missing required field: {field}")

        # Type validation
        if not isinstance(festival["predicted_demand_increase_percent"], (int, float)):
            raise ValueError(f"festival_forecasts[{i}].predicted_demand_increase_percent must be numeric")

        if not isinstance(festival["confidence"], (int, float)) or not (0 <= festival["confidence"] <= 100):
            raise ValueError(f"festival_forecasts[{i}].confidence must be 0-100")

    if "overall_assessment" in data:
        if data["overall_assessment"] not in valid_assessments:
            raise ValueError(f"overall_assessment must be one of {valid_assessments}")

    logger.info("Festival forecast validation passed")
    return data


def validate_peak_analysis(data: dict) -> dict:
    """
    Validate peak demand pattern analysis.

    Args:
        data: Raw response from Groq

    Returns:
        Validated analysis dict

    Raises:
        ValueError: If structure is invalid
    """
    if not isinstance(data, dict):
        raise ValueError("Peak analysis must be a dictionary")

    # Required fields
    required = ["peak_days_of_week", "peak_blood_groups", "peak_urgency_distribution"]
    for field in required:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")

    # Validate peak_days_of_week
    if not isinstance(data["peak_days_of_week"], list):
        raise ValueError("peak_days_of_week must be a list")

    valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for day_info in data["peak_days_of_week"]:
        if not isinstance(day_info, dict) or "day" not in day_info:
            raise ValueError("Each peak day must have a 'day' field")
        if day_info["day"] not in valid_days:
            raise ValueError(f"Invalid day: {day_info['day']}")

    # Validate peak_blood_groups
    if not isinstance(data["peak_blood_groups"], list):
        raise ValueError("peak_blood_groups must be a list")

    # Validate urgency distribution
    urgency = data["peak_urgency_distribution"]
    if not isinstance(urgency, dict):
        raise ValueError("peak_urgency_distribution must be a dictionary")

    valid_urgencies = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    total_pct = sum(urgency.get(u, 0) for u in valid_urgencies)
    if not (95 <= total_pct <= 105):  # Allow for rounding
        raise ValueError(f"Urgency percentages must sum to ~100 (got {total_pct})")

    logger.info("Peak analysis validation passed")
    return data


def validate_seasonal_analysis(data: dict) -> dict:
    """
    Validate seasonal pattern analysis.

    Args:
        data: Raw response from Groq

    Returns:
        Validated analysis dict

    Raises:
        ValueError: If structure is invalid
    """
    if not isinstance(data, dict):
        raise ValueError("Seasonal analysis must be a dictionary")

    if "months" not in data:
        raise ValueError("Missing required field: months")

    if not isinstance(data["months"], list):
        raise ValueError("months must be a list")

    valid_months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    for i, month_data in enumerate(data["months"]):
        if not isinstance(month_data, dict):
            raise ValueError(f"months[{i}] must be a dictionary")

        if "month" not in month_data or month_data["month"] not in valid_months:
            raise ValueError(f"months[{i}] has invalid or missing month name")

        if "demand_level" in month_data:
            if month_data["demand_level"] not in ["high", "medium", "low"]:
                raise ValueError(f"months[{i}].demand_level must be high/medium/low")

    logger.info("Seasonal analysis validation passed")
    return data
