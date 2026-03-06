"""
Unit tests for graph query utilities.
Given/When/Then structure, ZOMBIES coverage.
"""
import pytest
from backend.graph import format_bbl, build_owner_query, build_property_query


def test_format_bbl_empty_string():
    with pytest.raises(ValueError):
        format_bbl("")


def test_format_bbl_valid():
    assert format_bbl("  1008350041  ") == "1008350041"


def test_format_bbl_none():
    with pytest.raises(ValueError):
        format_bbl(None)


def test_format_bbl_invalid_non_digits():
    with pytest.raises(ValueError):
        format_bbl("invalid")


def test_format_bbl_too_short():
    with pytest.raises(ValueError):
        format_bbl("12345")


def test_build_owner_query_returns_string():
    q = build_owner_query("EMPIRE STATE")
    assert "OWNER" in q and "EMPIRE STATE" in q


def test_build_property_query_returns_string():
    q = build_property_query("1008350041")
    assert "BBL" in q and "1008350041" in q
