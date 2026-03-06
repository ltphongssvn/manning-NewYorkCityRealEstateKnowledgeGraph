"""FastAPI backend for NYC Real Estate Knowledge Graph."""
import os
import pickle
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.graph import format_bbl

app = FastAPI(title="NYC Real Estate Knowledge Graph API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embeddings at startup if available
EMBEDDINGS_DIR = Path(__file__).parent.parent / "gpu_training_results" / "outputs" / "embeddings"
_node2vec_embeddings = {}
_bbl_nodes = []

def _load_embeddings():
    global _node2vec_embeddings, _bbl_nodes
    emb_path = EMBEDDINGS_DIR / "node2vec_emb.txt"
    nodes_path = EMBEDDINGS_DIR / "graphsage_nodes.npy"
    if emb_path.exists():
        with open(emb_path) as f:
            header = next(f)
            expected_dim = int(header.strip().split()[1])
            for line in f:
                parts = line.strip().split()
                if len(parts) == expected_dim + 1:
                    try:
                        _node2vec_embeddings[parts[0]] = np.array(parts[1:], dtype=float)
                    except ValueError:
                        continue
    if nodes_path.exists():
        _bbl_nodes = [n for n in np.load(nodes_path, allow_pickle=True).tolist()
                      if n in _node2vec_embeddings]

_load_embeddings()


class TraverseRequest(BaseModel):
    bbl: str
    hops: int = 2


@app.get("/api/health")
def health():
    return {"status": "ok", "embeddings_loaded": len(_node2vec_embeddings) > 0}


@app.get("/api/stats")
def stats():
    return {
        "nodes": len(_node2vec_embeddings),
        "edges": 0,
        "embeddings": len(_node2vec_embeddings),
        "bbl_nodes": len(_bbl_nodes),
    }


@app.get("/api/properties/{bbl}")
def get_property(bbl: str):
    try:
        bbl = format_bbl(bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {bbl}")
    return {"bbl": bbl, "owners": [], "message": "Connect Neo4j for full data"}


@app.get("/api/owners/{name}")
def get_owner(name: str):
    name = name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Owner name cannot be empty")
    return {"name": name, "properties": [], "message": "Connect Neo4j for full data"}


@app.get("/api/recommend/{bbl}")
def recommend(bbl: str, n: int = 5):
    try:
        bbl = format_bbl(bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {bbl}")
    if bbl not in _node2vec_embeddings:
        raise HTTPException(status_code=404, detail=f"BBL {bbl} not found in embeddings")
    from sklearn.neighbors import NearestNeighbors
    bbl_keys = [k for k in _node2vec_embeddings if len(k) == 10 and k.isdigit()]
    if len(bbl_keys) < 2:
        return {"bbl": bbl, "recommendations": []}
    matrix = np.vstack([_node2vec_embeddings[k] for k in bbl_keys])
    idx = bbl_keys.index(bbl)
    knn = NearestNeighbors(n_neighbors=min(n + 1, len(bbl_keys)), metric='cosine')
    knn.fit(matrix)
    distances, indices = knn.kneighbors(matrix[idx].reshape(1, -1))
    recs = [{"bbl": bbl_keys[i], "distance": round(distances[0][j+1], 4)}
            for j, i in enumerate(indices[0][1:])]
    return {"bbl": bbl, "recommendations": recs}


@app.post("/api/graph/traverse")
def traverse(req: TraverseRequest):
    try:
        bbl = format_bbl(req.bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {req.bbl}")
    return {"bbl": bbl, "hops": req.hops, "nodes": [], "edges": [],
            "message": "Connect Neo4j for graph traversal"}
