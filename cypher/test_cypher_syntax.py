"""
Unit tests for Cypher script utilities.
Given/When/Then, ZOMBIES coverage.
"""
import pytest
from pathlib import Path


def test_milestone2_cypher_file_exists():
    """Given cypher dir, When checking milestone2, Then file exists."""
    assert Path("cypher/milestone_2_queries.cypher").exists()


def test_milestone3_cypher_file_exists():
    """Given cypher dir, When checking milestone3, Then file exists."""
    assert Path("cypher/milestone_3_queries.cypher").exists()


def test_milestone2_contains_load_csv():
    """Given milestone2 file, When reading, Then contains LOAD CSV."""
    content = Path("cypher/milestone_2_queries.cypher").read_text()
    assert "LOAD CSV" in content


def test_milestone3_contains_tax_assessor():
    """Given milestone3 file, When reading, Then contains TAX_ASSESSOR_OWNER."""
    content = Path("cypher/milestone_3_queries.cypher").read_text()
    assert "TAX_ASSESSOR_OWNER" in content


def test_milestone3_contains_deed_owner():
    """Given milestone3 file, When reading, Then contains DEED_OWNER."""
    content = Path("cypher/milestone_3_queries.cypher").read_text()
    assert "DEED_OWNER" in content


def test_milestone3_contains_permit_owner():
    """Given milestone3 file, When reading, Then contains PERMIT_OWNER."""
    content = Path("cypher/milestone_3_queries.cypher").read_text()
    assert "PERMIT_OWNER" in content
