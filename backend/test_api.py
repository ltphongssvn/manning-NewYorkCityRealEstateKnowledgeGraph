"""API integration tests - Given/When/Then, ZOMBIES coverage."""
import numpy as np
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
import backend.app as app_module
from backend.app import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_has_embeddings_key():
    response = client.get("/api/health")
    assert "embeddings_loaded" in response.json()


def test_stats_returns_node_counts():
    response = client.get("/api/stats")
    assert response.status_code == 200
    assert "nodes" in response.json()
    assert "edges" in response.json()


def test_stats_has_bbl_nodes_key():
    response = client.get("/api/stats")
    assert "bbl_nodes" in response.json()


def test_property_invalid_bbl_returns_404():
    response = client.get("/api/properties/invalid")
    assert response.status_code == 404


def test_property_valid_bbl_returns_200():
    response = client.get("/api/properties/1008350041")
    assert response.status_code == 200
    assert response.json()["bbl"] == "1008350041"


def test_owners_returns_200():
    response = client.get("/api/owners/EMPIRE STATE")
    assert response.status_code == 200
    assert response.json()["name"] == "EMPIRE STATE"


def test_owners_empty_name_returns_422():
    response = client.get("/api/owners/ ")
    assert response.status_code in [404, 422]


def test_owners_special_chars_returns_200():
    response = client.get("/api/owners/NYC PARKS DEPT")
    assert response.status_code == 200


def test_recommend_unknown_bbl_returns_404():
    response = client.get("/api/recommend/9999999999")
    assert response.status_code == 404


def test_recommend_invalid_bbl_returns_404():
    response = client.get("/api/recommend/invalid")
    assert response.status_code == 404


def test_recommend_bbl_not_in_embeddings_returns_404():
    response = client.get("/api/recommend/0000000000")
    assert response.status_code == 404


def test_recommend_valid_bbl_returns_200(monkeypatch):
    monkeypatch.setattr(app_module, "_node2vec_embeddings", {
        "1008350041": np.array([0.1] * 64),
        "1008350042": np.array([0.2] * 64),
        "1008350043": np.array([0.3] * 64),
    })
    response = client.get("/api/recommend/1008350041")
    assert response.status_code == 200
    assert "recommendations" in response.json()


def test_recommend_default_n_returns_200(monkeypatch):
    monkeypatch.setattr(app_module, "_node2vec_embeddings", {
        "1008350041": np.array([0.1] * 64),
        "1008350042": np.array([0.2] * 64),
        "1008350043": np.array([0.3] * 64),
    })
    response = client.get("/api/recommend/1008350041?n=3")
    assert response.status_code == 200
    assert len(response.json()["recommendations"]) <= 3


def test_graph_traverse_returns_200():
    response = client.post("/api/graph/traverse", json={"bbl": "1008350041", "hops": 2})
    assert response.status_code == 200
    assert "nodes" in response.json()


def test_graph_traverse_invalid_bbl_returns_404():
    response = client.post("/api/graph/traverse", json={"bbl": "invalid", "hops": 2})
    assert response.status_code == 404


def test_traverse_default_hops():
    response = client.post("/api/graph/traverse", json={"bbl": "1008350041", "hops": 1})
    assert response.status_code == 200
    assert "edges" in response.json()


def test_recommend_fewer_than_2_bbl_keys_returns_empty(monkeypatch):
    monkeypatch.setattr(app_module, "_node2vec_embeddings",
                        {"1008350041": np.array([1.0, 2.0])})
    response = client.get("/api/recommend/1008350041")
    assert response.status_code == 200
    assert response.json()["recommendations"] == []
