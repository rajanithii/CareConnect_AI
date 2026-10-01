import os
from uuid import uuid4

from fastapi.testclient import TestClient
from jose import jwt

from app.auth.auth_decorator import ALGORITHM, SECRET_KEY
from app.database import SessionLocal
from app.forecasting.demand_analyzer import DemandAnalyzer
from app.main import app
from app.models.hospital import Hospital
from app.security import hash_password


def test_demand_analyzer_default_model_is_supported():
    original = os.environ.get("GROQ_MODEL")
    os.environ.pop("GROQ_MODEL", None)
    try:
        analyzer = DemandAnalyzer(api_key="test-key")
        assert analyzer.model == "llama-3.1-8b-instant"
    finally:
        if original is None:
            os.environ.pop("GROQ_MODEL", None)
        else:
            os.environ["GROQ_MODEL"] = original


def test_hospital_profile_endpoint_exists():
    client = TestClient(app)
    response = client.get("/hospital/profile")
    assert response.status_code == 401, response.text

    db = SessionLocal()
    try:
        hospital = db.query(Hospital).first()
        if hospital is None:
            hospital = Hospital(
                name="Test Hospital",
                email=f"test-hospital-{uuid4()}@example.com",
                password=hash_password("SecurePass123!"),
                phone="1234567890",
                city="Test City",
                address="123 Test Street",
            )
            db.add(hospital)
            db.commit()
            db.refresh(hospital)

        token = jwt.encode(
            {"sub": hospital.email, "id": hospital.id, "role": "hospital"},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        response = client.get(
            "/hospital/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200, response.text
        payload = response.json()
        assert payload["email"] == hospital.email
        assert payload["name"] == hospital.name
    finally:
        db.rollback()
        db.close()
