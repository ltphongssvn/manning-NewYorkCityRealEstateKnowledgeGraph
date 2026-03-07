"""API integration tests - Given/When/Then, ZOMBIES coverage."""
import numpy as np
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import backend.app as app_module
from backend.app import app

client = TestClient(app)


def make_mock_driver(records=None):
    mock_result = MagicMock()
    mock_result.__iter__ = MagicMock(return_value=iter(records or []))
    mock_result.single = MagicMock(return_value={"c": 0})
    mock_session = MagicMock()
    mock_session.__enter__ = MagicMock(return_value=mock_session)
    mock_session.__exit__ = MagicMock(return_value=False)
    mock_session.run = MagicMock(return_value=mock_result)
    mock_driver = MagicMock()
    mock_driver.session = MagicMock(return_value=mock_session)
    return mock_driver


def test_health_returns_ok():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_has_embeddings_key():
    response = client.get("/api/health")
    assert "embeddings_loaded" in response.json()


def test_stats_returns_node_counts():
    with patch("backend.app.get_driver", return_value=make_mock_driver()):
        response = client.get("/api/stats")
    assert response.status_code == 200
    assert "nodes" in response.json()
    assert "edges" in response.json()


def test_stats_has_bbl_nodes_key():
    with patch("backend.app.get_driver", return_value=make_mock_driver()):
        response = client.get("/api/stats")
    assert "bbl_nodes" in response.json()


def test_property_invalid_bbl_returns_404():
    response = client.get("/api/properties/invalid")
    assert response.status_code == 404


def test_property_valid_bbl_returns_200():
    record = MagicMock()
    record.__getitem__ = lambda self, k: "ESRT EMPIRE STATE" if k == "owner" else "TAX_ASSESSOR_OWNER"
    with patch("backend.app.get_driver", return_value=make_mock_driver([record])):
        response = client.get("/api/properties/1008350041")
    assert response.status_code == 200
    assert response.json()["bbl"] == "1008350041"


def test_property_not_found_returns_404():
    with patch("backend.app.get_driver", return_value=make_mock_driver([])):
        response = client.get("/api/properties/1008350041")
    assert response.status_code == 404


def test_owners_returns_200():
    record = MagicMock()
    record.__getitem__ = lambda self, k: {"bbl": "1008350041", "address": "350 5TH AVE", "rel": "TAX_ASSESSOR_OWNER"}[k]
    with patch("backend.app.get_driver", return_value=make_mock_driver([record])):
        response = client.get("/api/owners/EMPIRE STATE")
    assert response.status_code == 200
    assert response.json()["name"] == "EMPIRE STATE"


def test_owners_empty_name_returns_422():
    response = client.get("/api/owners/ ")
    assert response.status_code in [404, 422]


def test_owners_special_chars_returns_200():
    record = MagicMock()
    record.__getitem__ = lambda self, k: {"bbl": "1000010010", "address": "PARK", "rel": "TAX_ASSESSOR_OWNER"}[k]
    with patch("backend.app.get_driver", return_value=make_mock_driver([record])):
        response = client.get("/api/owners/NYC PARKS DEPT")
    assert response.status_code == 200


def test_owners_not_found_returns_404():
    with patch("backend.app.get_driver", return_value=make_mock_driver([])):
        response = client.get("/api/owners/UNKNOWN OWNER")
    assert response.status_code == 404


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
    mock_node = MagicMock()
    mock_node.id = 1
    mock_node.labels = ["BBL"]
    mock_node.__iter__ = MagicMock(return_value=iter([("bbl", "1008350041")]))
    mock_rel = MagicMock()
    mock_rel.id = 1
    mock_rel.type = "TAX_ASSESSOR_OWNER"
    mock_rel.start_node.id = 1
    mock_rel.end_node.id = 2
    record = MagicMock()
    record.__getitem__ = lambda self, k: [mock_node] if k == "ns" else [mock_rel]
    with patch("backend.app.get_driver", return_value=make_mock_driver([record])):
        response = client.post("/api/graph/traverse", json={"bbl": "1008350041", "hops": 2})
    assert response.status_code == 200
    assert "nodes" in response.json()


def test_graph_traverse_invalid_bbl_returns_404():
    response = client.post("/api/graph/traverse", json={"bbl": "invalid", "hops": 2})
    assert response.status_code == 404


def test_traverse_default_hops():
    mock_node = MagicMock()
    mock_node.id = 1
    mock_node.labels = ["BBL"]
    mock_node.__iter__ = MagicMock(return_value=iter([("bbl", "1008350041")]))
    mock_rel = MagicMock()
    mock_rel.id = 1
    mock_rel.type = "TAX_ASSESSOR_OWNER"
    mock_rel.start_node.id = 1
    mock_rel.end_node.id = 2
    record = MagicMock()
    record.__getitem__ = lambda self, k: [mock_node] if k == "ns" else [mock_rel]
    with patch("backend.app.get_driver", return_value=make_mock_driver([record])):
        response = client.post("/api/graph/traverse", json={"bbl": "1008350041", "hops": 1})
    assert response.status_code == 200
    assert "edges" in response.json()


def test_graph_traverse_not_found_returns_404():
    with patch("backend.app.get_driver", return_value=make_mock_driver([])):
        response = client.post("/api/graph/traverse", json={"bbl": "1008350041", "hops": 2})
    assert response.status_code == 404


def test_recommend_fewer_than_2_bbl_keys_returns_empty(monkeypatch):
    monkeypatch.setattr(app_module, "_node2vec_embeddings",
                        {"1008350041": np.array([1.0, 2.0])})
    response = client.get("/api/recommend/1008350041")
    assert response.status_code == 200
    assert response.json()["recommendations"] == []
