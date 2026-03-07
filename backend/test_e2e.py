"""End-to-end smoke tests - marked e2e, no external dependencies."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
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


@pytest.mark.e2e
def test_e2e_health_smoke():
    response = client.get("/api/health")
    assert response.status_code == 200


@pytest.mark.e2e
def test_e2e_stats_smoke():
    with patch("backend.app.get_driver", return_value=make_mock_driver()):
        response = client.get("/api/stats")
    assert response.status_code == 200


@pytest.mark.e2e
def test_e2e_property_pipeline():
    record = MagicMock()
    record.__getitem__ = lambda self, k: "ESRT EMPIRE STATE" if k == "owner" else "TAX_ASSESSOR_OWNER"
    with patch("backend.app.get_driver", return_value=make_mock_driver([record])):
        response = client.get("/api/properties/1008350041")
    assert response.status_code == 200
    assert response.json()["bbl"] == "1008350041"


@pytest.mark.e2e
def test_e2e_traverse_pipeline():
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
