from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    assert response.json()["total_events"] == 18243


def test_incidents():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    assert response.json()["count"] == 4
