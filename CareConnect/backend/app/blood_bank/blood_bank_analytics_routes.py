from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.blood_bank import (
    OverviewStatOut,
    BloodGroupDatumOut,
    UsageTrendDatumOut,
    InventoryHeatmapOut,
)

from app.services import blood_bank_analytics_service


router = APIRouter(
    prefix="/blood-bank/analytics",
    tags=["Blood Inventory Analytics"]
)


@router.get("/overview", response_model=list[OverviewStatOut])
def get_overview(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_analytics_service.get_overview_stats(db, hospital_id)


@router.get("/blood-group-distribution", response_model=list[BloodGroupDatumOut])
def get_blood_group_distribution(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_analytics_service.get_blood_group_distribution(db, hospital_id)


@router.get("/usage-trend", response_model=list[UsageTrendDatumOut])
def get_usage_trend(
    hospital_id: int,
    months: int = Query(default=6, ge=1, le=24),
    db: Session = Depends(get_db)
):
    return blood_bank_analytics_service.get_monthly_usage_trend(db, hospital_id, months)


@router.get("/status-heatmap", response_model=InventoryHeatmapOut)
def get_status_heatmap(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_analytics_service.get_status_heatmap(db, hospital_id)
