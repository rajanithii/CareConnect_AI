import uuid
from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.blood_inventory import BloodUnit
from app.models.blood_unit_log import BloodUnitLog
from app.models.storage_location import StorageLocation
from app.schemas.blood_bank import (
    BloodUnitCreate,
    StorageLocationCreate,
    VALID_BLOOD_GROUPS,
    VALID_COMPONENT_TYPES,
)


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _generate_unit_code(hospital_id: int) -> str:
    return f"BU-{hospital_id}-{uuid.uuid4().hex[:8].upper()}"


def _log(
    db: Session,
    blood_unit_id: int,
    action: str,
    previous_status: str | None,
    new_status: str | None,
    performed_by_hospital_id: int | None = None,
    notes: str | None = None,
):
    entry = BloodUnitLog(
        blood_unit_id=blood_unit_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        performed_by_hospital_id=performed_by_hospital_id,
        notes=notes,
    )
    db.add(entry)


def _get_unit_or_404(db: Session, unit_id: int) -> BloodUnit:
    unit = db.query(BloodUnit).filter(BloodUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Blood unit not found")
    return unit


# ------------------------------------------------------------------
# Storage locations
# ------------------------------------------------------------------

def create_storage_location(db: Session, payload: StorageLocationCreate) -> StorageLocation:
    location = StorageLocation(
        hospital_id=payload.hospital_id,
        name=payload.name,
        location_type=payload.location_type,
        temperature_range=payload.temperature_range,
        capacity=payload.capacity,
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def list_storage_locations(db: Session, hospital_id: int) -> list[StorageLocation]:
    return (
        db.query(StorageLocation)
        .filter(StorageLocation.hospital_id == hospital_id, StorageLocation.is_active == True)
        .order_by(StorageLocation.name)
        .all()
    )


# ------------------------------------------------------------------
# Blood units — core lifecycle
# ------------------------------------------------------------------

def create_blood_unit(db: Session, payload: BloodUnitCreate) -> BloodUnit:
    if payload.blood_group not in VALID_BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail=f"Invalid blood_group '{payload.blood_group}'")

    if payload.component_type not in VALID_COMPONENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid component_type '{payload.component_type}'")

    if payload.expiry_date <= date.today():
        raise HTTPException(status_code=400, detail="expiry_date must be in the future")

    if payload.storage_location_id is not None:
        location = db.query(StorageLocation).filter(
            StorageLocation.id == payload.storage_location_id,
            StorageLocation.hospital_id == payload.hospital_id,
        ).first()
        if not location:
            raise HTTPException(status_code=404, detail="Storage location not found for this hospital")

    unit = BloodUnit(
        unit_code=_generate_unit_code(payload.hospital_id),
        hospital_id=payload.hospital_id,
        donor_id=payload.donor_id,
        blood_group=payload.blood_group,
        component_type=payload.component_type,
        volume_ml=payload.volume_ml,
        collection_date=payload.collection_date,
        expiry_date=payload.expiry_date,
        source=payload.source,
        storage_location_id=payload.storage_location_id,
        notes=payload.notes,
        status="AVAILABLE",
    )
    db.add(unit)
    db.flush()  # get unit.id before commit so the log row can reference it

    _log(
        db,
        blood_unit_id=unit.id,
        action="RECEIVED",
        previous_status=None,
        new_status="AVAILABLE",
        performed_by_hospital_id=payload.hospital_id,
        notes=f"Unit received via {payload.source}",
    )

    db.commit()
    db.refresh(unit)
    return unit


def list_blood_units(
    db: Session,
    hospital_id: int,
    blood_group: str | None = None,
    component_type: str | None = None,
    status: str | None = None,
    expiring_within_days: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[BloodUnit]:
    query = db.query(BloodUnit).filter(BloodUnit.hospital_id == hospital_id)

    if blood_group:
        query = query.filter(BloodUnit.blood_group == blood_group)

    if component_type:
        query = query.filter(BloodUnit.component_type == component_type)

    if status:
        query = query.filter(BloodUnit.status == status)

    if expiring_within_days is not None:
        cutoff = date.today() + timedelta(days=expiring_within_days)
        query = query.filter(BloodUnit.expiry_date <= cutoff)

    return (
        query.order_by(BloodUnit.expiry_date.asc())  # FIFO-friendly ordering by default
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_blood_unit(db: Session, unit_id: int) -> BloodUnit:
    return _get_unit_or_404(db, unit_id)


def get_blood_unit_by_code(db: Session, unit_code: str) -> BloodUnit:
    unit = db.query(BloodUnit).filter(BloodUnit.unit_code == unit_code).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Blood unit not found for this code")
    return unit


def get_unit_logs(db: Session, unit_id: int) -> list[BloodUnitLog]:
    _get_unit_or_404(db, unit_id)
    return (
        db.query(BloodUnitLog)
        .filter(BloodUnitLog.blood_unit_id == unit_id)
        .order_by(BloodUnitLog.created_at.desc())
        .all()
    )


def reserve_blood_unit(db: Session, unit_id: int, request_id: int) -> BloodUnit:
    unit = _get_unit_or_404(db, unit_id)

    if unit.status != "AVAILABLE":
        raise HTTPException(
            status_code=400,
            detail=f"Unit is '{unit.status}', only AVAILABLE units can be reserved",
        )

    previous_status = unit.status
    unit.status = "RESERVED"
    unit.reserved_for_request_id = request_id

    _log(
        db,
        blood_unit_id=unit.id,
        action="RESERVED",
        previous_status=previous_status,
        new_status="RESERVED",
        performed_by_hospital_id=unit.hospital_id,
        notes=f"Reserved for blood_request_id={request_id}",
    )

    db.commit()
    db.refresh(unit)
    return unit


def unreserve_blood_unit(db: Session, unit_id: int) -> BloodUnit:
    unit = _get_unit_or_404(db, unit_id)

    if unit.status != "RESERVED":
        raise HTTPException(status_code=400, detail="Only RESERVED units can be unreserved")

    previous_status = unit.status
    unit.status = "AVAILABLE"
    unit.reserved_for_request_id = None

    _log(
        db,
        blood_unit_id=unit.id,
        action="UNRESERVED",
        previous_status=previous_status,
        new_status="AVAILABLE",
        performed_by_hospital_id=unit.hospital_id,
    )

    db.commit()
    db.refresh(unit)
    return unit


def issue_blood_unit(db: Session, unit_id: int, issued_to: str | None) -> BloodUnit:
    unit = _get_unit_or_404(db, unit_id)

    if unit.status not in ("AVAILABLE", "RESERVED"):
        raise HTTPException(
            status_code=400,
            detail=f"Unit is '{unit.status}', cannot be issued",
        )

    previous_status = unit.status
    unit.status = "ISSUED"

    _log(
        db,
        blood_unit_id=unit.id,
        action="ISSUED",
        previous_status=previous_status,
        new_status="ISSUED",
        performed_by_hospital_id=unit.hospital_id,
        notes=issued_to,
    )

    db.commit()
    db.refresh(unit)
    return unit


def discard_blood_unit(db: Session, unit_id: int, reason: str) -> BloodUnit:
    unit = _get_unit_or_404(db, unit_id)

    if unit.status in ("ISSUED", "DISCARDED"):
        raise HTTPException(status_code=400, detail=f"Unit is already '{unit.status}'")

    previous_status = unit.status
    unit.status = "DISCARDED"

    _log(
        db,
        blood_unit_id=unit.id,
        action="DISCARDED",
        previous_status=previous_status,
        new_status="DISCARDED",
        performed_by_hospital_id=unit.hospital_id,
        notes=reason,
    )

    db.commit()
    db.refresh(unit)
    return unit


def move_blood_unit(db: Session, unit_id: int, storage_location_id: int) -> BloodUnit:
    unit = _get_unit_or_404(db, unit_id)

    location = db.query(StorageLocation).filter(
        StorageLocation.id == storage_location_id,
        StorageLocation.hospital_id == unit.hospital_id,
    ).first()
    if not location:
        raise HTTPException(status_code=404, detail="Storage location not found for this hospital")

    unit.storage_location_id = storage_location_id

    _log(
        db,
        blood_unit_id=unit.id,
        action="MOVED",
        previous_status=unit.status,
        new_status=unit.status,
        performed_by_hospital_id=unit.hospital_id,
        notes=f"Moved to storage_location_id={storage_location_id}",
    )

    db.commit()
    db.refresh(unit)
    return unit


def scan_and_expire_units(db: Session, hospital_id: int | None = None) -> list[BloodUnit]:
    """
    Finds all units past their expiry_date that are still AVAILABLE or
    RESERVED and flips them to EXPIRED with an audit log entry. This is
    the minimal expiry hook for Module 1 — full alerting/FIFO planning
    is built out in Module 7 (Blood Expiry Management), which will call
    into this same function rather than duplicating the transition logic.
    """
    query = db.query(BloodUnit).filter(
        BloodUnit.expiry_date < date.today(),
        BloodUnit.status.in_(["AVAILABLE", "RESERVED"]),
    )

    if hospital_id is not None:
        query = query.filter(BloodUnit.hospital_id == hospital_id)

    expired_units = query.all()

    for unit in expired_units:
        previous_status = unit.status
        unit.status = "EXPIRED"
        _log(
            db,
            blood_unit_id=unit.id,
            action="EXPIRED",
            previous_status=previous_status,
            new_status="EXPIRED",
            performed_by_hospital_id=unit.hospital_id,
            notes="Auto-expired: past expiry_date",
        )

    if expired_units:
        db.commit()
        for unit in expired_units:
            db.refresh(unit)

    return expired_units


def get_inventory_summary(db: Session, hospital_id: int) -> dict:
    """
    Lightweight counts for the blood bank dashboard header. Full trend
    analytics (usage over time, heatmaps, KPIs) belongs to Module 2 —
    this only answers "what do we have right now."
    """
    units = db.query(BloodUnit).filter(BloodUnit.hospital_id == hospital_id).all()

    by_status: dict[str, int] = {}
    by_blood_group: dict[str, int] = {}
    by_component_type: dict[str, int] = {}

    cutoff = date.today() + timedelta(days=7)
    expiring_soon = 0

    for unit in units:
        by_status[unit.status] = by_status.get(unit.status, 0) + 1
        by_blood_group[unit.blood_group] = by_blood_group.get(unit.blood_group, 0) + 1
        by_component_type[unit.component_type] = by_component_type.get(unit.component_type, 0) + 1

        if unit.status in ("AVAILABLE", "RESERVED") and unit.expiry_date <= cutoff:
            expiring_soon += 1

    return {
        "hospital_id": hospital_id,
        "total_units": len(units),
        "by_status": by_status,
        "by_blood_group": by_blood_group,
        "by_component_type": by_component_type,
        "expiring_within_7_days": expiring_soon,
    }
