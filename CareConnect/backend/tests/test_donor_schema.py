from fastapi.testclient import TestClient
from app.main import app


def test_donors_endpoint_returns_200_with_blank_email_values():
    client = TestClient(app)
    response = client.get('/donors/?skip=0&limit=100')
    assert response.status_code == 200
