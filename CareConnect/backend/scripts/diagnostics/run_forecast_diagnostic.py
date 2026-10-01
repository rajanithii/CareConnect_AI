import os
import traceback
from app.database import SessionLocal
from app.forecasting.forecasting_service import get_forecasting_service

try:
    db = SessionLocal()
    service = get_forecasting_service(db)
    result = service.forecast_demand(hospital_id=1, days_ahead=30, include_recommendations=True)
    print(result.model_dump())
except Exception as e:
    print(type(e).__name__, e)
    traceback.print_exc()
finally:
    db.close()
