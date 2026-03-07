# cypher/seed_neo4j.py
"""Load NYC_Tax_Property_Features.csv into Neo4j."""
import csv
import os
from neo4j import GraphDatabase

URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
USER = os.getenv("NEO4J_USERNAME", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")  # pragma: allowlist secret
CSV_PATH = os.getenv("CSV_PATH", "/mnt/c/Users/LENOVO/Downloads/NYC_Tax_Property_Features.csv")
BATCH_SIZE = 1000

def load(driver, rows):
    with driver.session() as session:
        session.run("""
            UNWIND $rows AS row
            MERGE (b:BBL {bbl: row.bbl})
              ON CREATE SET b.address = row.address
            FOREACH (_ IN CASE WHEN row.owner IS NOT NULL AND row.owner <> '' THEN [1] ELSE [] END |
              MERGE (o:OWNER {name: row.owner})
              MERGE (o)-[:TAX_ASSESSOR_OWNER {date: '2026'}]->(b)
            )
        """, rows=rows)

def main():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    batch = []
    total = 0
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            bbl = (row.get("parid") or "").strip().strip('"')
            owner = (row.get("owner") or "").strip().strip('"')
            address = (row.get("street_name") or "").strip().strip('"')
            if not bbl:
                continue
            batch.append({"bbl": bbl, "owner": owner, "address": address})
            if len(batch) >= BATCH_SIZE:
                load(driver, batch)
                total += len(batch)
                print(f"Loaded {total} records...")
                batch = []
        if batch:
            load(driver, batch)
            total += len(batch)
    print(f"Done. Total records loaded: {total}")
    driver.close()

if __name__ == "__main__":
    main()
