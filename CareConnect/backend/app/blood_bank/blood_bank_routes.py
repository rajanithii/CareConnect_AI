from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.blood_bank import (
    BloodUnitCreate,
    BloodUnitOut,
    BloodUnitReserveInput,
    BloodUnitIssueInput,
    BloodUnitDiscardInput,
    BloodUnitMoveInput,
    BloodUnitLogOut,
    StorageLocationCreate,
    StorageLocationOut,
    InventorySummaryOut,
)

from app.services import blood_bank_service


router = APIRouter(
    prefix="/blood-bank",
    tags=["Smart Blood Bank Management"]
)


# ============================================
# Storage Locations
# ============================================

@router.post("/locations", response_model=StorageLocationOut)
def create_storage_location(
    payload: StorageLocationCreate,
    db: Session = Depends(get_db)
):
    return blood_bank_service.create_storage_location(db, payload)


@router.get("/locations", response_model=list[StorageLocationOut])
def list_storage_locations(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_service.list_storage_locations(db, hospital_id)


# ============================================
# Blood Units — CRUD + lookup
# ============================================

@router.post("/units", response_model=BloodUnitOut)
def create_blood_unit(
    payload: BloodUnitCreate,
    db: Session = Depends(get_db)
):
    return blood_bank_service.create_blood_unit(db, payload)


@router.get("/units", response_model=list[BloodUnitOut])
def list_blood_units(
    hospital_id: int,
    blood_group: str | None = None,
    component_type: str | None = None,
    status: str | None = None,
    expiring_within_days: int | None = Query(default=None, ge=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    return blood_bank_service.list_blood_units(
        db,
        hospital_id=hospital_id,
        blood_group=blood_group,
        component_type=component_type,
        status=status,
        expiring_within_days=expiring_within_days,
        skip=skip,
        limit=limit,
    )


@router.get("/units/code/{unit_code}", response_model=BloodUnitOut)
def get_blood_unit_by_code(
    unit_code: str,
    db: Session = Depends(get_db)
):
    # QR/barcode scan lookup — placed before /units/{unit_id} is irrelevant
    # here since the path segments differ, but kept close to the detail
    # route for readability.
    return blood_bank_service.get_blood_unit_by_code(db, unit_code)


@router.get("/units/{unit_id}", response_model=BloodUnitOut)
def get_blood_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_service.get_blood_unit(db, unit_id)


@router.get("/units/{unit_id}/logs", response_model=list[BloodUnitLogOut])
def get_blood_unit_logs(
    unit_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_service.get_unit_logs(db, unit_id)


# ============================================
# Blood Units — lifecycle transitions
# ============================================

@router.patch("/units/{unit_id}/reserve", response_model=BloodUnitOut)
def reserve_blood_unit(
    unit_id: int,
    payload: BloodUnitReserveInput,
    db: Session = Depends(get_db)
):
    return blood_bank_service.reserve_blood_unit(db, unit_id, payload.request_id)


@router.patch("/units/{unit_id}/unreserve", response_model=BloodUnitOut)
def unreserve_blood_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_service.unreserve_blood_unit(db, unit_id)


@router.patch("/units/{unit_id}/issue", response_model=BloodUnitOut)
def issue_blood_unit(
    unit_id: int,
    payload: BloodUnitIssueInput,
    db: Session = Depends(get_db)
):
    return blood_bank_service.issue_blood_unit(db, unit_id, payload.issued_to)


@router.patch("/units/{unit_id}/discard", response_model=BloodUnitOut)
def discard_blood_unit(
    unit_id: int,
    payload: BloodUnitDiscardInput,
    db: Session = Depends(get_db)
):
    return blood_bank_service.discard_blood_unit(db, unit_id, payload.reason)


@router.patch("/units/{unit_id}/location", response_model=BloodUnitOut)
def move_blood_unit(
    unit_id: int,
    payload: BloodUnitMoveInput,
    db: Session = Depends(get_db)
):
    return blood_bank_service.move_blood_unit(db, unit_id, payload.storage_location_id)


@router.post("/units/scan-expired", response_model=list[BloodUnitOut])
def scan_and_expire_units(
    hospital_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Manually triggers an expiry sweep. In production this would also be
    called from a scheduled job; exposing it as an endpoint lets the
    admin portal (Module 8) and expiry dashboard (Module 7) trigger it
    on demand too, reusing this exact logic instead of duplicating it.
    """
    return blood_bank_service.scan_and_expire_units(db, hospital_id)


# ============================================
# Inventory Summary
# ============================================

@router.get("/summary", response_model=InventorySummaryOut)
def get_inventory_summary(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    return blood_bank_service.get_inventory_summary(db, hospital_id)
