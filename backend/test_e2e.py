"""End-to-end smoke tests - marked e2e, no external dependencies."""
import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


@pytest.mark.e2e
def test_e2e_health_smoke():
    response = client.get("/api/health")
    assert response.status_code == 200


@pytest.mark.e2e
def test_e2e_stats_smoke():
    response = client.get("/api/stats")
    assert response.status_code == 200


@pytest.mark.e2e
def test_e2e_property_pipeline():
    response = client.get("/api/properties/1008350041")
    assert response.status_code == 200
    assert response.json()["bbl"] == "1008350041"


@pytest.mark.e2e
def test_e2e_traverse_pipeline():
    response = client.post("/api/graph/traverse", json={"bbl": "1008350041", "hops": 2})
    assert response.status_code == 200
