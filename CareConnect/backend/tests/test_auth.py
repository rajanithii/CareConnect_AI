"""
Comprehensive Unit & Integration Tests for JWT Authentication and Role-Based Access Control.
"""

import os
import sys
import pytest
from datetime import datetime, timezone, timedelta
from jose import jwt
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import SessionLocal
from app.models.hospital import Hospital
from app.models.blood_inventory import BloodUnit
from app.shortage_prediction.models import ShortageAlert
from app.admin_portal.models import SystemAlert

client = TestClient(app)

SECRET_KEY = os.getenv("SECRET_KEY", "BloodLink_AI_Secret_Key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


def create_token(user_id: int = 1, email: str = "hospital@test.com", role: str = "hospital") -> str:
    payload = {
        "sub": email,
        "id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    db = SessionLocal()
    try:
        h1 = db.query(Hospital).filter_by(id=1).first()
        if not h1:
            h1 = Hospital(id=1, name="City Medical", email="city@test.com", password="hash", phone="555-0101", city="New York")
            db.add(h1)
        h2 = db.query(Hospital).filter_by(id=2).first()
        if not h2:
            h2 = Hospital(id=2, name="Regional BB", email="regional@test.com", password="hash", phone="555-0202", city="New York")
            db.add(h2)

        unit = db.query(BloodUnit).filter_by(hospital_id=1).first()
        if not unit:
            unit = BloodUnit(hospital_id=1, blood_group="O-", unit_code="O-TEST-001", status="AVAILABLE", expiry_date=datetime.utcnow().date() + timedelta(days=5))
            db.add(unit)

        sys_alert = db.query(SystemAlert).first()
        if not sys_alert:
            sys_alert = SystemAlert(alert_type="CRITICAL", severity="CRITICAL", message="System Alert Test", status="ACTIVE")
            db.add(sys_alert)

        db.commit()
    finally:
        db.close()


def test_endpoint_without_auth_fails():
    """Protected endpoints should reject requests without Authorization header."""
    response = client.post("/shortage-prediction/analyze", json={"hospital_id": 1, "days_ahead": 7})
    # HTTPBearer returns 401 or 403 when header is missing
    assert response.status_code in [401, 403]


def test_endpoint_with_invalid_token_fails():
    """Protected endpoints should reject invalid or forged tokens."""
    headers = {"Authorization": "Bearer invalid.token.value"}
    response = client.post("/shortage-prediction/analyze", json={"hospital_id": 1, "days_ahead": 7}, headers=headers)
    assert response.status_code == 401


def test_hospital_access_own_data():
    """Hospital user with valid JWT can analyze its own shortage risk."""
    token = create_token(user_id=1, role="hospital")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/shortage-prediction/analyze", json={"hospital_id": 1, "days_ahead": 7}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["hospital_id"] == 1


def test_cross_hospital_access_forbidden():
    """Hospital 1 cannot view or analyze Hospital 2's protected data."""
    token = create_token(user_id=1, role="hospital")  # Token for hospital 1
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/shortage-prediction/analyze", json={"hospital_id": 2, "days_ahead": 7}, headers=headers)
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_hospital_token_on_admin_endpoint_forbidden():
    """Hospital users cannot access admin-only endpoints."""
    token = create_token(user_id=1, role="hospital")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/admin/dashboard", headers=headers)
    assert response.status_code == 403
    assert "admin role required" in response.json()["detail"].lower()


def test_admin_token_on_admin_endpoint_success():
    """Admin users can successfully access admin-only endpoints."""
    token = create_token(user_id=999, email="admin@bloodlink.com", role="admin")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/admin/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "current_snapshot" in data


def test_admin_can_access_any_hospital_data():
    """Admin users can analyze data for any hospital."""
    token = create_token(user_id=999, email="admin@bloodlink.com", role="admin")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/shortage-prediction/analyze", json={"hospital_id": 1, "days_ahead": 7}, headers=headers)
    assert response.status_code == 200


def test_public_health_endpoints_accessible():
    """Health check endpoints must remain public and return 200 without token."""
    r1 = client.get("/shortage-prediction/health")
    assert r1.status_code == 200
    r2 = client.get("/recommendations/health")
    assert r2.status_code == 200
    r3 = client.get("/inter-hospital-exchange/health")
    assert r3.status_code == 200
    r4 = client.get("/blood-expiry/health")
    assert r4.status_code == 200
    r5 = client.get("/admin/health")
    assert r5.status_code == 200
