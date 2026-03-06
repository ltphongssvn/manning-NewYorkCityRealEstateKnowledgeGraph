"""
API integration tests - Given/When/Then, ZOMBIES coverage.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_stats_returns_node_counts():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data


def test_property_invalid_bbl_returns_404():
    response = client.get("/api/properties/invalid")
    assert response.status_code == 404


def test_owners_empty_name_returns_422():
    response = client.get("/api/owners/ ")
    assert response.status_code in [404, 422]


def test_recommend_unknown_bbl_returns_404():
    response = client.get("/api/recommend/9999999999")
    assert response.status_code == 404
