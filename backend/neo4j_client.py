"""
Neo4j driver factory and connection utilities.
Credentials always via environment variables - never hardcoded.
"""
import os
from neo4j import GraphDatabase


def get_driver(uri: str = None, username: str = None, password: str = None):
    """Create a Neo4j driver instance from env vars or explicit params."""
    uri = uri or os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    username = username or os.environ.get("NEO4J_USERNAME", "neo4j")
    password = password or os.environ.get("NEO4J_PASSWORD", "")  # pragma: allowlist secret
    return GraphDatabase.driver(uri, auth=(username, password))


def close_driver(driver) -> None:
    """Safely close a Neo4j driver."""
    if driver:
        driver.close()
