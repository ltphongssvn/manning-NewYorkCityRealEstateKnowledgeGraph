# NYC Real Estate Knowledge Graph

A full-stack application that builds and queries a knowledge graph of NYC real estate ownership using Neo4j, Python, and public NYC Open Data records (tax assessor, deeds, permits).

## Overview

This project constructs a knowledge graph linking properties (BBL), owners, and contact addresses extracted from three NYC public data sources. It enables discovery of true property owners through 2nd and 3rd degree graph connections — useful for real estate research and investment analysis.

**Data Sources:** NYC Department of Finance (tax records, deeds) · NYC Department of Buildings (permits)

## Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                 │
│              Expo SDK · Neo4j queries · Graph viz            │
├──────────────────────────────────────────────────────────────┤
│                  Web Frontend (React + TypeScript)           │
│              Vite · Neo4j Browser · Graph visualization      │
├──────────────────────────────────────────────────────────────┤
│                     FastAPI Backend                          │
│         /api/graph  /api/owners  /api/properties             │
│              Neo4j Python driver · Cypher queries            │
├──────────────────────────────────────────────────────────────┤
│                     Neo4j Graph Database                     │
│    Nodes: BBL · OWNER · CONTACT_ADDRESS                      │
│    Edges: TAX_ASSESSOR_OWNER · DEED_OWNER · PERMIT_OWNER     │
├──────────────────────────────────────────────────────────────┤
│                  Docker (Multi-stage)                        │
│         Node 22 (build) → Python 3.12 (runtime)              │
└──────────────────────────────────────────────────────────────┘
```

## Knowledge Graph Schema

Three node types and three relationship types encode ownership across data sources:

| Node | Properties | Description |
|------|-----------|-------------|
| `BBL` | `bbl`, `address` | NYC Borough-Block-Lot property identifier |
| `OWNER` | `name` | Listed owner (individual or LLC) |
| `CONTACT_ADDRESS` | `address` | Owner mailing address |

| Relationship | Properties | Source |
|-------------|-----------|--------|
| `TAX_ASSESSOR_OWNER` | `date` | NYC Tax Assessor records |
| `DEED_OWNER` | `date` | NYC Recorder of Deeds |
| `PERMIT_OWNER` | `date` | NYC Department of Buildings permits |

## Tech Stack

**Backend:** FastAPI · Neo4j Python driver 5.x · pandas · scikit-learn · uvicorn

**Frontend:** React 19 · TypeScript · Vite 7 · Neo4j JavaScript driver

**Mobile:** React Native 0.81 · Expo SDK 54 · EAS Build

**Graph DB:** Neo4j 5.x · Cypher · APOC library · Graph Data Science (GDS) library

**ML Pipeline:** node2vec · TransE · TransR · GraphSAGE · t-SNE · k-NN

**Infrastructure:** Docker (multi-stage) · Railway · GitHub Actions CI (5 jobs)

**GPU Cluster (Harvard OOD):** 4× NVIDIA L4 (23GB VRAM each) · CUDA 12.8 · Driver 570.172.08 · TensorFlow 2.20 · PyTorch 2.10

**Testing:** pytest + vitest · 80% per-file coverage enforced · TDD (Red-Green-Refactor)

**Security:** pre-commit/pre-push hooks · detect-secrets · SECURITY.md

**Git Workflow:** GitFlow (main → develop → feature branches) · PR-based merges

## Project Structure
```
├── backend/
│   ├── app.py                 # FastAPI application (routes, CORS)
│   ├── graph.py               # Neo4j connection and Cypher query logic
│   ├── inference.py           # ML inference (node2vec, KNN recommendations)
│   ├── data/
│   │   ├── NYC_Tax_Project_1_Final_Small.csv
│   │   ├── NYC_Deeds_Project_1_Final_Small.csv
│   │   └── NYC_Permit_Project_1_Final_Small.csv
│   ├── test_api.py            # API integration tests
│   └── test_graph.py          # Graph query unit tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main UI (graph visualization)
│   │   ├── GraphView.tsx      # Neo4j graph rendering
│   │   └── App.test.tsx       # Component tests
│   ├── package.json
│   └── vite.config.ts         # Vitest config with 80% coverage thresholds
├── mobile/
│   ├── App.tsx                # Root component
│   ├── HomeScreen.tsx         # Property search + graph traversal
│   ├── GraphScreen.tsx        # Interactive graph visualization
│   └── eas.json               # EAS Build profiles
├── notebooks/
│   ├── 01-01-deliverable.ipynb   # Milestone 1: Data prep
│   ├── 02-01-deliverable.ipynb   # Milestone 2: Node deduplication
│   ├── 02-02-deliverable.ipynb   # Milestone 2: node2vec embeddings
│   ├── 02-03-deliverable.ipynb   # Milestone 2: KNN + t-SNE
│   ├── 03-01-deliverable.ipynb   # Milestone 3: TransE + TransR
│   ├── 03-02-deliverable.ipynb   # Milestone 3: GraphSAGE
│   └── 03-03-deliverable.ipynb   # Milestone 3: Recommender system
├── cypher/
│   ├── milestone_2_queries.cypher  # Neo4j load + query scripts
│   └── milestone_3_queries.cypher  # Multi-source owner discovery
├── .github/
│   └── workflows/ci.yml       # 5-job CI pipeline
├── .pre-commit-config.yaml    # Pre-commit + pre-push hooks
├── .secrets.baseline          # detect-secrets baseline (clean)
├── pyproject.toml             # Python deps, pytest config, coverage thresholds
├── SECURITY.md                # Security practices documentation
└── README.md
```

## Project Milestones

### Milestone 1 — Graphs from Real-World Data
Extract and prepare NYC real estate data (tax, deeds, permits) into graph-ready CSV files. Identify BBL, OWNER, and CONTACT_ADDRESS entities.

### Milestone 2 — Find Hidden Connections with Graphs
Load data into Neo4j. Apply NLP + graph techniques to deduplicate noisy owner names. Generate node2vec embeddings and analyze with KNN + t-SNE.

### Milestone 3 — Leverage Embeddings
Train TransE, TransR, and GraphSAGE models. Build a real estate property recommendation system using graph embeddings.

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 22+
- Neo4j Desktop 1.6+ (with APOC and GDS plugins)
- Docker (optional)
- uv (Python package manager)

### Local Setup (GPU recommended for ML milestones)
```bash
git clone https://github.com/ltphongssvn/manning-NewYorkCityRealEstateKnowledgeGraph.git
cd manning-NewYorkCityRealEstateKnowledgeGraph

# Install pre-commit hooks
pip install pre-commit && pre-commit install && pre-commit install --hook-type pre-push

# Python environment
pip install uv && uv sync --group dev

# Backend
uv run uvicorn backend.app:app --reload

# Frontend (separate terminal)
cd frontend && npm ci && npm run dev
```

### Using Harvard OOD GPU Cluster (ML training only)

1. Go to [https://ood.huit.harvard.edu](https://ood.huit.harvard.edu)
2. Click **Interactive Apps** > **Jupyter Lab - CS 1090B (GPU)**
3. Launch, wait, and connect when ready
4. Upload notebooks from `notebooks/` via the file browser

### Neo4j Setup

1. Install Neo4j Desktop and create a new DBMS (version 5.x)
2. Install plugins: **APOC** and **Graph Data Science**
3. Set `apoc.import.file.enabled=true` in database config
4. Place CSV files in the Neo4j import folder
5. Run Cypher scripts from `cypher/` to load the graph

## Running Tests
```bash
# Backend unit + integration tests
uv run pytest -v

# Backend with coverage report
uv run pytest --cov=backend --cov-report=term-missing --cov-branch

# Frontend tests
cd frontend && npx vitest run

# Frontend with coverage
cd frontend && npx vitest run --coverage

# All pre-commit hooks
pre-commit run --all-files
```

## Test-Driven Development (TDD)

Follows Red-Green-Refactor with Given/When/Then structure and ZOMBIES mnemonic for edge cases.

| Layer | Tests | Trigger | Framework |
|-------|-------|---------|-----------|
| Backend graph unit | TBD | pre-commit, CI | pytest |
| Backend API integration | TBD | pre-commit, CI | pytest + httpx |
| Frontend component | TBD | pre-commit, CI | vitest + jsdom |
| **Coverage minimum** | **80% per-file** | pre-push, CI | all |

## CI/CD Pipeline

GitHub Actions runs 5 parallel jobs on every push:

| Job | What It Does |
|-----|-------------|
| **backend-tests** | pytest with 80% per-file coverage |
| **frontend-tests** | vitest with 80% per-file coverage |
| **neo4j-integration** | Cypher query tests against Neo4j service container |
| **security-scan** | detect-secrets audit |
| **docker-build** | Full Docker image build verification |

## Security

See [SECURITY.md](SECURITY.md) for full details. Key measures:

| Layer | Implementation |
|-------|---------------|
| Secret Detection | detect-secrets + `.secrets.baseline` |
| Binary Protection | Blocks `.h5`, `.pkl`, `.pth`, `.onnx`, `.dump` |
| Environment Protection | Blocks `.env` files from commits |
| Dependency Scanning | `uv audit` + `npm audit` in CI |
| Neo4j Credentials | Environment variables only, never hardcoded |
| CORS | FastAPI middleware, restrict origins in production |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/properties/{bbl}` | Get property and owner info by BBL |
| `GET` | `/api/owners/{name}` | Find all properties for an owner |
| `POST` | `/api/graph/traverse` | Multi-hop graph traversal |
| `GET` | `/api/recommend/{bbl}` | Similar properties via KNN embeddings |
| `GET` | `/api/stats` | Graph statistics (node/edge counts) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEO4J_URI` | Neo4j connection URI (e.g. `bolt://localhost:7687`) |
| `NEO4J_USERNAME` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |
| `PORT` | Server port (default: `8000`) |

## Git Workflow (GitFlow)
```
main (production) ← develop (integration) ← feature/* (work)
```

PRs require all CI checks to pass before merging.

## License

Part of the Manning liveProject series: *ML for Knowledge Graphs with Neo4j*
(Graphs from Real-World Data · Find Hidden Connections with Graphs · Leverage Embeddings)
