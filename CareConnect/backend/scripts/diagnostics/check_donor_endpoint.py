from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
response = client.get('/donors/?skip=0&limit=100')
print(response.status_code)
print(response.text[:1000])
