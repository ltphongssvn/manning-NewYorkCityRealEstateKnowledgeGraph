"""
Unit tests for graph query utilities.
Given/When/Then structure, ZOMBIES coverage.
"""
import pytest
from backend.graph import format_bbl


# Zero
def test_format_bbl_empty_string():
    """Given empty string, When format_bbl called, Then raises ValueError."""
    with pytest.raises(ValueError):
        format_bbl("")


# One
def test_format_bbl_valid():
    """Given valid BBL string, When format_bbl called, Then returns stripped string."""
    assert format_bbl("  1008350041  ") == "1008350041"


# Boundaries
def test_format_bbl_none():
    """Given None, When format_bbl called, Then raises ValueError."""
    with pytest.raises(ValueError):
        format_bbl(None)
