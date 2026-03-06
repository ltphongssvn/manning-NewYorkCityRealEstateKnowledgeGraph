"""Unit tests for Neo4j connection utilities."""
import pytest
from backend.neo4j_client import get_driver, close_driver


def test_get_driver_returns_object():
    driver = get_driver("bolt://localhost:7687", "neo4j", "test")  # pragma: allowlist secret
    assert driver is not None
    close_driver(driver)


def test_close_driver_does_not_raise():
    driver = get_driver("bolt://localhost:7687", "neo4j", "test")  # pragma: allowlist secret
    close_driver(driver)
