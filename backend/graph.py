"""
Neo4j graph query utilities.
Pure functions for Cypher query construction and result formatting.
"""
import re


def format_bbl(bbl: str) -> str:
    """Validate and normalize a BBL identifier (exactly 10 digits)."""
    if bbl is None:
        raise ValueError("BBL cannot be None")
    stripped = str(bbl).strip()
    if not stripped:
        raise ValueError("BBL cannot be empty")
    if not re.match(r'^\d{10}$', stripped):
        raise ValueError(f"BBL must be exactly 10 digits, got: {stripped}")
    return stripped


def build_owner_query(name: str) -> str:
    """Build Cypher query to find all BBLs for an owner."""
    return f"MATCH (o:OWNER {{name: '{name}'}})-[r]->(b:BBL) RETURN o, r, b"


def build_property_query(bbl: str) -> str:
    """Build Cypher query to find all owners for a BBL."""
    return f"MATCH (o:OWNER)-[r]->(b:BBL {{bbl: '{bbl}'}}) RETURN o, r, b"
