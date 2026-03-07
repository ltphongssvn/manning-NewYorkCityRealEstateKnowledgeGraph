"""FastAPI backend for NYC Real Estate Knowledge Graph."""
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.neighbors import NearestNeighbors
from backend.graph import format_bbl
from backend.neo4j_client import get_driver, close_driver

app = FastAPI(title="NYC Real Estate Knowledge Graph API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EMBEDDINGS_DIR = Path(__file__).parent.parent / "gpu_training_results" / "outputs" / "embeddings"
_node2vec_embeddings: dict = {}
_bbl_nodes: list = []


def _parse_embedding_line(line: str, expected_dim: int) -> tuple:
    parts = line.strip().split()
    if len(parts) != expected_dim + 1:
        raise ValueError(f"Expected {expected_dim + 1} parts, got {len(parts)}")
    return parts[0], np.array(parts[1:], dtype=float)


def _get_bbl_keys(embeddings: dict) -> list:
    return [k for k in embeddings if len(k) == 10 and k.isdigit()]


def _load_embeddings(embeddings_dir: Path = EMBEDDINGS_DIR) -> tuple:
    node2vec = {}
    bbl_nodes = []
    keys_path = embeddings_dir / "node2vec_keys.npy"
    vecs_path = embeddings_dir / "node2vec_vecs.npy"
    txt_path = embeddings_dir / "node2vec_emb.txt"
    nodes_path = embeddings_dir / "graphsage_nodes.npy"

    if keys_path.exists() and vecs_path.exists():
        keys = np.load(keys_path, allow_pickle=True).tolist()
        vecs = np.load(vecs_path, allow_pickle=True)
        node2vec = {k: vecs[i] for i, k in enumerate(keys)}
    elif txt_path.exists():
        with open(txt_path) as f:
            header = next(f)
            expected_dim = int(header.strip().split()[1])
            for line in f:
                try:
                    key, vec = _parse_embedding_line(line, expected_dim)
                    node2vec[key] = vec
                except ValueError:
                    continue

    if nodes_path.exists():
        bbl_nodes = [n for n in np.load(nodes_path, allow_pickle=True).tolist()
                     if n in node2vec]
    return node2vec, bbl_nodes


_node2vec_embeddings, _bbl_nodes = _load_embeddings()


class TraverseRequest(BaseModel):
    bbl: str
    hops: int = 2


@app.get("/api/health")
def health():
    return {"status": "ok", "embeddings_loaded": len(_node2vec_embeddings) > 0}


@app.get("/api/stats")
def stats():
    try:
        driver = get_driver()
        with driver.session() as session:
            node_count = session.run("MATCH (n) RETURN count(n) AS c").single()["c"]
            edge_count = session.run("MATCH ()-[r]->() RETURN count(r) AS c").single()["c"]
    except Exception:
        node_count, edge_count = 0, 0
    return {
        "nodes": node_count,
        "edges": edge_count,
        "embeddings": len(_node2vec_embeddings),
        "bbl_nodes": len(_bbl_nodes),
    }


@app.get("/api/properties/{bbl}")
def get_property(bbl: str):
    try:
        bbl = format_bbl(bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {bbl}")
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                "MATCH (b:BBL {bbl: $bbl})<-[r]-(o:OWNER) RETURN o.name AS owner, type(r) AS rel",
                bbl=bbl
            )
            owners = [{"name": r["owner"], "relationship": r["rel"]} for r in result]
        if not owners:
            raise HTTPException(status_code=404, detail=f"BBL {bbl} not found")
        return {"bbl": bbl, "owners": owners}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/owners/{name}")
def get_owner(name: str):
    name = name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Owner name cannot be empty")
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                "MATCH (o:OWNER {name: $name})-[r]->(b:BBL) RETURN b.bbl AS bbl, b.address AS address, type(r) AS rel",
                name=name
            )
            properties = [{"bbl": r["bbl"], "address": r["address"], "relationship": r["rel"]} for r in result]
        if not properties:
            raise HTTPException(status_code=404, detail=f"Owner '{name}' not found")
        return {"name": name, "properties": properties}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recommend/{bbl}")
def recommend(bbl: str, n: int = 5):
    try:
        bbl = format_bbl(bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {bbl}")
    if bbl not in _node2vec_embeddings:
        raise HTTPException(status_code=404, detail=f"BBL {bbl} not found in embeddings")
    bbl_keys = _get_bbl_keys(_node2vec_embeddings)
    if len(bbl_keys) < 2:
        return {"bbl": bbl, "recommendations": []}
    matrix = np.vstack([_node2vec_embeddings[k] for k in bbl_keys])
    idx = bbl_keys.index(bbl)
    knn = NearestNeighbors(n_neighbors=min(n + 1, len(bbl_keys)), metric='cosine')
    knn.fit(matrix)
    distances, indices = knn.kneighbors(matrix[idx].reshape(1, -1))
    recs = [{"bbl": bbl_keys[i], "distance": round(float(distances[0][j + 1]), 4)}
            for j, i in enumerate(indices[0][1:])]
    return {"bbl": bbl, "recommendations": recs}


@app.post("/api/graph/traverse")
def traverse(req: TraverseRequest):
    try:
        bbl = format_bbl(req.bbl)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invalid BBL: {req.bbl}")
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                """
                MATCH path = (b:BBL {bbl: $bbl})<-[*1..$hops]-(n)
                RETURN nodes(path) AS ns, relationships(path) AS rs
                """,
                bbl=bbl, hops=req.hops
            )
            nodes_set = {}
            edges = []
            for record in result:
                for node in record["ns"]:
                    nid = str(node.id)
                    if nid not in nodes_set:
                        nodes_set[nid] = {"id": nid, "labels": list(node.labels), "properties": dict(node)}
                for rel in record["rs"]:
                    edges.append({
                        "id": str(rel.id),
                        "type": rel.type,
                        "start": str(rel.start_node.id),
                        "end": str(rel.end_node.id),
                    })
        nodes = list(nodes_set.values())
        if not nodes:
            raise HTTPException(status_code=404, detail=f"BBL {bbl} not found")
        return {"bbl": bbl, "hops": req.hops, "nodes": nodes, "edges": edges}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
