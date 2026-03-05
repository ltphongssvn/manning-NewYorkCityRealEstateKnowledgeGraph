"""
Neo4j graph query utilities.
Pure functions for Cypher query construction and result formatting.
"""


def format_bbl(bbl: str) -> str:
    """Validate and normalize a BBL identifier.

    Args:
        bbl: Borough-Block-Lot string, possibly with whitespace.

    Returns:
        Stripped BBL string.

    Raises:
        ValueError: If bbl is None or empty after stripping.
    """
    if bbl is None:
        raise ValueError("BBL cannot be None")
    stripped = str(bbl).strip()
    if not stripped:
        raise ValueError("BBL cannot be empty")
    return stripped
