import calendar
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.blood_inventory import BloodUnit
from app.models.blood_unit_log import BloodUnitLog
from app.schemas.blood_bank import VALID_BLOOD_GROUPS, VALID_UNIT_STATUSES
from app.services.blood_bank_service import get_inventory_summary


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _month_bucket_start(d: date) -> date:
    return d.replace(day=1)


def _shift_month(d: date, months: int) -> date:
    """Move a date back/forward by whole months, always landing on day 1."""
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    return date(year, month, 1)


def _last_n_month_buckets(n: int) -> list[date]:
    current = _month_bucket_start(date.today())
    return [_shift_month(current, -offset) for offset in range(n - 1, -1, -1)]


def _pct_change(current: float, previous: float) -> str | None:
    if previous == 0:
        return None
    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.1f}%"


# ------------------------------------------------------------------
# KPI Overview
# ------------------------------------------------------------------

def get_overview_stats(db: Session, hospital_id: int) -> list[dict]:
    summary = get_inventory_summary(db, hospital_id)

    today = date.today()
    this_month_start = _month_bucket_start(today)
    last_month_start = _shift_month(this_month_start, -1)

    issued_this_month = db.query(BloodUnitLog).join(
        BloodUnit, BloodUnit.id == BloodUnitLog.blood_unit_id
    ).filter(
        BloodUnit.hospital_id == hospital_id,
        BloodUnitLog.action == "ISSUED",
        BloodUnitLog.created_at >= this_month_start,
    ).count()

    issued_last_month = db.query(BloodUnitLog).join(
        BloodUnit, BloodUnit.id == BloodUnitLog.blood_unit_id
    ).filter(
        BloodUnit.hospital_id == hospital_id,
        BloodUnitLog.action == "ISSUED",
        BloodUnitLog.created_at >= last_month_start,
        BloodUnitLog.created_at < this_month_start,
    ).count()

    wasted_this_month = db.query(BloodUnitLog).join(
        BloodUnit, BloodUnit.id == BloodUnitLog.blood_unit_id
    ).filter(
        BloodUnit.hospital_id == hospital_id,
        BloodUnitLog.action.in_(["EXPIRED", "DISCARDED"]),
        BloodUnitLog.created_at >= this_month_start,
    ).count()

    wasted_last_month = db.query(BloodUnitLog).join(
        BloodUnit, BloodUnit.id == BloodUnitLog.blood_unit_id
    ).filter(
        BloodUnit.hospital_id == hospital_id,
        BloodUnitLog.action.in_(["EXPIRED", "DISCARDED"]),
        BloodUnitLog.created_at >= last_month_start,
        BloodUnitLog.created_at < this_month_start,
    ).count()

    return [
        {
            "label": "Available units",
            "value": str(summary["by_status"].get("AVAILABLE", 0)),
            "delta": None,
        },
        {
            "label": "Units issued (this month)",
            "value": str(issued_this_month),
            "delta": _pct_change(issued_this_month, issued_last_month),
        },
        {
            "label": "Expiring within 7 days",
            "value": str(summary["expiring_within_7_days"]),
            "delta": None,
        },
        {
            "label": "Wastage (expired/discarded, this month)",
            "value": str(wasted_this_month),
            "delta": _pct_change(wasted_this_month, wasted_last_month),
        },
    ]


# ------------------------------------------------------------------
# Blood Group Distribution (current live stock only)
# ------------------------------------------------------------------

def get_blood_group_distribution(db: Session, hospital_id: int) -> list[dict]:
    units = db.query(BloodUnit).filter(
        BloodUnit.hospital_id == hospital_id,
        BloodUnit.status.in_(["AVAILABLE", "RESERVED"]),
    ).all()

    counts = {bg: 0 for bg in sorted(VALID_BLOOD_GROUPS)}
    for unit in units:
        counts[unit.blood_group] = counts.get(unit.blood_group, 0) + 1

    return [{"name": bg, "value": count} for bg, count in counts.items()]


# ------------------------------------------------------------------
# Monthly Usage Trend (units issued per month, last N months)
# ------------------------------------------------------------------

def get_monthly_usage_trend(db: Session, hospital_id: int, months: int = 6) -> list[dict]:
    buckets = _last_n_month_buckets(months)

    logs = db.query(BloodUnitLog).join(
        BloodUnit, BloodUnit.id == BloodUnitLog.blood_unit_id
    ).filter(
        BloodUnit.hospital_id == hospital_id,
        BloodUnitLog.action == "ISSUED",
        BloodUnitLog.created_at >= buckets[0],
    ).all()

    counts = {b: 0 for b in buckets}
    for log in logs:
        bucket = _month_bucket_start(log.created_at.date())
        if bucket in counts:
            counts[bucket] += 1

    return [
        {"month": calendar.month_abbr[b.month], "units": counts[b]}
        for b in buckets
    ]


# ------------------------------------------------------------------
# Status Heatmap (blood group x status matrix, current live inventory)
# ------------------------------------------------------------------

def get_status_heatmap(db: Session, hospital_id: int) -> dict:
    blood_groups = sorted(VALID_BLOOD_GROUPS)
    statuses = sorted(VALID_UNIT_STATUSES)

    units = db.query(BloodUnit).filter(BloodUnit.hospital_id == hospital_id).all()

    grid = {bg: {s: 0 for s in statuses} for bg in blood_groups}
    for unit in units:
        if unit.blood_group in grid and unit.status in grid[unit.blood_group]:
            grid[unit.blood_group][unit.status] += 1

    matrix = [[grid[bg][s] for s in statuses] for bg in blood_groups]

    return {
        "blood_groups": blood_groups,
        "statuses": statuses,
        "matrix": matrix,
    }
