"""Tests targeting remaining uncovered branches in app.py."""
import numpy as np
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path
from backend.app import _parse_embedding_line, _get_bbl_keys, _load_embeddings


def test_parse_embedding_line_wrong_length_raises():
    with pytest.raises(ValueError):
        _parse_embedding_line("key 1.0 2.0", expected_dim=5)


def test_parse_embedding_line_valid():
    key, vec = _parse_embedding_line("key 1.0 2.0 3.0", expected_dim=3)
    assert key == "key"
    assert len(vec) == 3


def test_get_bbl_keys_filters_non_bbl():
    emb = {"1008350041": np.zeros(4), "EMPIRE STATE": np.zeros(4), "123": np.zeros(4)}
    keys = _get_bbl_keys(emb)
    assert keys == ["1008350041"]


def test_load_embeddings_missing_dir_returns_empty():
    node2vec, bbl_nodes = _load_embeddings(Path("/nonexistent/path"))
    assert node2vec == {}
    assert bbl_nodes == []


def test_recommend_fewer_than_2_bbl_keys_returns_empty(monkeypatch):
    from backend import app as app_module
    monkeypatch.setattr(app_module, "_node2vec_embeddings",
                        {"1008350041": np.array([1.0, 2.0])})
    from fastapi.testclient import TestClient
    client = TestClient(app_module.app)
    response = client.get("/api/recommend/1008350041")
    assert response.status_code == 200
    assert response.json()["recommendations"] == []
