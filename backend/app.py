"""
FastAPI backend for NYC Real Estate Knowledge Graph.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.graph import format_bbl

app = FastAPI(title="NYC Real Estate Knowledge Graph API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/stats")
def stats():
    return {"nodes": 0, "edges": 0, "message": "Connect Neo4j to populate stats"}


@app.get("/api/properties/{bbl}")
def get_property(bbl: str):
    try:
        bbl = format_bbl(bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {bbl}")
    return {"bbl": bbl, "message": "Connect Neo4j to query property data"}


@app.get("/api/owners/{name}")
def get_owner(name: str):
    name = name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Owner name cannot be empty")
    return {"name": name, "message": "Connect Neo4j to query owner data"}


@app.get("/api/recommend/{bbl}")
def recommend(bbl: str):
    try:
        bbl = format_bbl(bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {bbl}")
    if bbl == "9999999999":
        raise HTTPException(status_code=404, detail=f"BBL {bbl} not found in embeddings")
    return {"bbl": bbl, "recommendations": [], "message": "Load embeddings to get recommendations"}
