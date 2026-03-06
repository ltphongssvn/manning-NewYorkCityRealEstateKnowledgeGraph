"""
Neo4j graph query utilities.
Pure functions for Cypher query construction and result formatting.
"""
import re


def format_bbl(bbl: str) -> str:
    """Validate and normalize a BBL identifier.

    BBL must be exactly 10 digits: 1 boro + 5 block + 4 lot.

    Raises:
        ValueError: If bbl is None, empty, or not 10 digits.
    """
    if bbl is None:
        raise ValueError("BBL cannot be None")
    stripped = str(bbl).strip()
    if not stripped:
        raise ValueError("BBL cannot be empty")
    if not re.match(r'^\d{10}$', stripped):
        raise ValueError(f"BBL must be exactly 10 digits, got: {stripped}")
    return stripped
