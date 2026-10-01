"""
AI Demand Forecasting Prompts

Groq LLM prompts for blood demand pattern analysis.
Follows the pattern of app/ai/prompts.py — strict JSON output, no preamble.
"""


DEMAND_FORECAST_SYSTEM_PROMPT = """You are an expert healthcare data analyst specializing in blood bank operations.
Your task is to analyze historical blood request patterns and generate accurate demand forecasts.
You always respond with valid JSON only — no explanation, no markdown, no preamble."""


DEMAND_FORECAST_PROMPT = """Analyze this historical blood request data and generate a 30-day demand forecast.

Data format: Each request has: date (YYYY-MM-DD), blood_group (e.g., O+, A-), quantity (units), urgency (CRITICAL/HIGH/MEDIUM/LOW).

Identify patterns:
- Trend (increasing/stable/decreasing)
- Seasonality (weekly/monthly patterns)
- Blood group preferences
- Urgency distribution
- Anomalies

Return ONLY valid JSON with this exact structure:
{
    "forecast_period_days": 30,
    "daily_forecasts": [
        {
            "date": "YYYY-MM-DD",
            "predicted_units": <int>,
            "confidence": <0-100>,
            "primary_blood_groups": [{"blood_group": "O+", "units": <int>}],
            "urgency_split": {"CRITICAL": <int>, "HIGH": <int>, "MEDIUM": <int>, "LOW": <int>}
        }
    ],
    "weekly_summary": [
        {
            "week_start": "YYYY-MM-DD",
            "total_predicted_units": <int>,
            "confidence": <0-100>
        }
    ],
    "trend": "increasing|stable|decreasing",
    "trend_confidence": <0-100>,
    "peak_days": ["Monday", "Friday"],
    "seasonal_factors": ["end_of_month", "weekends"],
    "anomalies_detected": ["description"],
    "recommendations": ["stock X+ by Y date", "plan staffing for Z surge"]
}

Historical data to analyze:
"""


FESTIVAL_FORECAST_PROMPT = """Analyze blood demand during festivals and special events.
Given a hospital's location and historical request data, predict demand spikes for upcoming events.

Input:
- Hospital location (city/region)
- Historical request data (dates, quantities, urgency)
- Upcoming events/festivals (dates, type, expected severity)

Output ONLY valid JSON:
{
    "festival_forecasts": [
        {
            "event_name": "string",
            "event_date": "YYYY-MM-DD",
            "predicted_demand_increase_percent": <0-500>,
            "predicted_total_units": <int>,
            "confidence": <0-100>,
            "primary_blood_groups_needed": ["O+", "AB+"],
            "urgency_expected": "CRITICAL|HIGH|MEDIUM",
            "preparation_days_needed": <int>,
            "notes": "explanation of prediction"
        }
    ],
    "overall_assessment": "major_spike|moderate_increase|minor_increase|normal"
}

Data provided:
"""


PEAK_DEMAND_ANALYSIS_PROMPT = """Analyze peak demand patterns in blood requests.

Identify:
- Peak days of week
- Peak blood groups (by frequency and quantity)
- Peak urgency levels
- Time-of-day patterns if available

Return ONLY valid JSON:
{
    "peak_days_of_week": [
        {
            "day": "Monday",
            "avg_requests": <float>,
            "avg_units": <float>,
            "rank": 1
        }
    ],
    "peak_blood_groups": [
        {
            "blood_group": "O+",
            "request_frequency_percent": <float>,
            "total_units_requested": <int>,
            "rank": 1
        }
    ],
    "peak_urgency_distribution": {
        "CRITICAL": <percent>,
        "HIGH": <percent>,
        "MEDIUM": <percent>,
        "LOW": <percent>
    },
    "peak_hour": "<HH:00>" or null,
    "data_quality_score": <0-100>,
    "insights": ["string"]
}

Request history to analyze:
"""


SEASONAL_DEMAND_PROMPT = """Analyze seasonal patterns in blood demand.

For each month, identify:
- Average demand level
- Variance
- Dominant blood groups
- Common urgencies
- Key observations

Return ONLY valid JSON:
{
    "months": [
        {
            "month": "January",
            "demand_level": "high|medium|low",
            "avg_requests": <float>,
            "avg_units": <float>,
            "variance": <float>,
            "primary_blood_groups": ["O+", "O-"],
            "notes": "string"
        }
    ],
    "peak_season": {
        "months": ["December", "January"],
        "reason": "winter illnesses, holiday accidents",
        "avg_units_per_day": <float>
    },
    "low_season": {
        "months": ["August"],
        "avg_units_per_day": <float>
    },
    "seasonal_recommendations": ["string"]
}

Monthly data to analyze:
"""
