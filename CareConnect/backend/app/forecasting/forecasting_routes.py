"""
AI Demand Forecasting API routes.

Endpoints for demand forecast, festival impact, peak analysis, seasonal analysis.
Production-grade error handling, input validation, structured responses.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.forecasting.schemas import (
    ForecastRequestInput,
    FestivalForecastInput,
    PeakAnalysisInput,
    SeasonalAnalysisInput,
    DemandForecastOut,
    FestivalForecastOut,
    PeakAnalysisOut,
    SeasonalAnalysisOut,
)
from app.forecasting.forecasting_service import get_forecasting_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/forecasting",
    tags=["AI Demand Forecasting"]
)


# ------------------------------------------------------------------
# Error Response Helpers
# ------------------------------------------------------------------

def _handle_forecast_error(error: Exception, context: str) -> HTTPException:
    """
    Standardize error responses for forecast operations.
    
    Args:
        error: Exception that occurred
        context: Description of operation (e.g., "demand forecast")
    
    Returns:
        HTTPException with appropriate status code and message
    """
    error_msg = str(error)
    logger.error(f"Forecasting error ({context}): {error_msg}")
    
    if isinstance(error, ValueError):
        if "insufficient" in error_msg.lower() or "empty" in error_msg.lower():
            return HTTPException(
                status_code=400,
                detail=f"Insufficient data for {context}: {error_msg}"
            )
        return HTTPException(status_code=400, detail=str(error))
    
    if isinstance(error, RuntimeError):
        return HTTPException(
            status_code=503,
            detail=f"AI analysis temporarily unavailable. Please try again later."
        )
    
    return HTTPException(
        status_code=500,
        detail=f"Internal error during {context}. Please contact support."
    )


# ------------------------------------------------------------------
# Demand Forecasting
# ------------------------------------------------------------------

@router.post("/demand", response_model=DemandForecastOut)
def forecast_demand(
    payload: ForecastRequestInput,
    db: Session = Depends(get_db)
):
    """
    Generate 30+ day demand forecast using AI pattern analysis.
    
    Analyzes historical blood requests and generates:
    - Daily unit predictions with confidence scores
    - Weekly summaries
    - Trend analysis (increasing/stable/decreasing)
    - Peak day identification
    - Operational recommendations
    
    Args:
        payload.hospital_id: Target hospital
        payload.days_ahead: Forecast horizon (7-365 days, default 30)
        payload.include_recommendations: Include operational guidance
    
    Returns:
        DemandForecastOut with daily/weekly forecasts, trends, recommendations
    
    Raises:
        400: Insufficient historical data
        503: AI service unavailable
    """
    try:
        logger.info(f"Forecast demand request: hospital_id={payload.hospital_id}, days={payload.days_ahead}")
        
        service = get_forecasting_service(db)
        forecast = service.forecast_demand(
            hospital_id=payload.hospital_id,
            days_ahead=payload.days_ahead,
            include_recommendations=payload.include_recommendations,
        )
        
        logger.info(f"Forecast completed successfully for hospital {payload.hospital_id}")
        return forecast
        
    except (ValueError, RuntimeError) as e:
        raise _handle_forecast_error(e, "demand forecast")
    except Exception as e:
        logger.exception("Unexpected error in demand forecast")
        raise HTTPException(status_code=500, detail="Unexpected error during forecast generation")


# ------------------------------------------------------------------
# Festival/Event Impact Forecasting
# ------------------------------------------------------------------

@router.post("/festival-impact", response_model=FestivalForecastOut)
def forecast_festival_impact(
    payload: FestivalForecastInput,
    db: Session = Depends(get_db)
):
    """
    Predict blood demand spikes during festivals and special events.
    
    Uses historical patterns + upcoming events to forecast:
    - Predicted demand increase % per event
    - Total predicted units needed
    - Primary blood groups to prioritize
    - Urgency levels expected
    - Days needed to prepare inventory
    
    Args:
        payload.hospital_id: Target hospital
        payload.events: List of {event_name, event_date (YYYY-MM-DD), event_type}
    
    Returns:
        FestivalForecastOut with per-event forecasts and overall assessment
    
    Raises:
        400: Invalid event data or insufficient historical data
        503: AI service unavailable
    """
    try:
        logger.info(f"Festival forecast request: hospital_id={payload.hospital_id}, events={len(payload.events)}")
        
        service = get_forecasting_service(db)
        forecast = service.forecast_festival_impact(
            hospital_id=payload.hospital_id,
            events=payload.events,
        )
        
        logger.info(f"Festival forecast completed for hospital {payload.hospital_id}")
        return forecast
        
    except (ValueError, RuntimeError) as e:
        raise _handle_forecast_error(e, "festival impact forecast")
    except Exception as e:
        logger.exception("Unexpected error in festival forecast")
        raise HTTPException(status_code=500, detail="Unexpected error during festival forecast")


# ------------------------------------------------------------------
# Peak Demand Pattern Analysis
# ------------------------------------------------------------------

@router.get("/peak-patterns", response_model=PeakAnalysisOut)
def analyze_peak_patterns(
    hospital_id: int,
    days_lookback: int = Query(default=90, ge=30, le=730),
    db: Session = Depends(get_db)
):
    """
    Identify peak demand days, blood groups, and urgency levels.
    
    Analyzes historical requests to identify:
    - Peak days of week (Monday-Sunday ranked by demand)
    - Peak blood groups (frequency, total units, ranking)
    - Peak urgency distribution (CRITICAL/HIGH/MEDIUM/LOW %)
    - Data quality score (confidence in analysis)
    
    Args:
        hospital_id: Target hospital
        days_lookback: Historical period to analyze (30-730 days, default 90)
    
    Returns:
        PeakAnalysisOut with ranked peaks and operational insights
    
    Raises:
        400: Insufficient historical data
        503: AI service unavailable
    """
    try:
        logger.info(f"Peak analysis request: hospital_id={hospital_id}, lookback={days_lookback} days")
        
        service = get_forecasting_service(db)
        analysis = service.analyze_peak_patterns(
            hospital_id=hospital_id,
            days_lookback=days_lookback,
        )
        
        logger.info(f"Peak analysis completed for hospital {hospital_id}")
        return analysis
        
    except (ValueError, RuntimeError) as e:
        raise _handle_forecast_error(e, "peak pattern analysis")
    except Exception as e:
        logger.exception("Unexpected error in peak analysis")
        raise HTTPException(status_code=500, detail="Unexpected error during peak analysis")


# ------------------------------------------------------------------
# Seasonal Demand Pattern Analysis
# ------------------------------------------------------------------

@router.get("/seasonal-patterns", response_model=SeasonalAnalysisOut)
def analyze_seasonal_patterns(
    hospital_id: int,
    months_lookback: int = Query(default=12, ge=3, le=36),
    db: Session = Depends(get_db)
):
    """
    Analyze seasonal (monthly) demand patterns.
    
    Identifies:
    - Monthly demand levels (high/medium/low)
    - Peak and low seasons
    - Month-to-month transitions
    - Seasonal recommendations for inventory planning
    
    Args:
        hospital_id: Target hospital
        months_lookback: Historical months to analyze (3-36, default 12)
    
    Returns:
        SeasonalAnalysisOut with monthly breakdown and season recommendations
    
    Raises:
        400: Insufficient historical data
        503: AI service unavailable
    """
    try:
        logger.info(f"Seasonal analysis request: hospital_id={hospital_id}, months={months_lookback}")
        
        service = get_forecasting_service(db)
        analysis = service.analyze_seasonal_patterns(
            hospital_id=hospital_id,
            months_lookback=months_lookback,
        )
        
        logger.info(f"Seasonal analysis completed for hospital {hospital_id}")
        return analysis
        
    except (ValueError, RuntimeError) as e:
        raise _handle_forecast_error(e, "seasonal pattern analysis")
    except Exception as e:
        logger.exception("Unexpected error in seasonal analysis")
        raise HTTPException(status_code=500, detail="Unexpected error during seasonal analysis")


# ------------------------------------------------------------------
# Health Check
# ------------------------------------------------------------------

@router.get("/health")
def health_check():
    """
    Check forecasting service health.
    
    Returns:
        {"status": "ok", "service": "forecasting"}
    """
    return {"status": "ok", "service": "forecasting"}
