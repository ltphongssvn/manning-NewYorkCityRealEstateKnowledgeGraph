# NYC Real Estate Knowledge Graph

A full-stack application that builds and queries a knowledge graph of NYC real estate ownership using Neo4j, Python, and public NYC Open Data records (tax assessor, deeds, permits).

## Overview

This project constructs a knowledge graph linking properties (BBL), owners, and contact addresses extracted from three NYC public data sources. It enables discovery of true property owners through 2nd and 3rd degree graph connections — useful for real estate research and investment analysis.

**Data Sources:** NYC Department of Finance (tax records, deeds) · NYC Department of Buildings (permits)

** Test Data**

**Properties route (`/properties`):**

| BBL | Address | Owner |
|---|---|---|
| `1008350041` | 5 AVENUE | ESRT EMPIRE STATE BUILDING, L.L.C. (Empire State Building) |
| `1000010010` | COMFORT ROAD | GOVERNORS ISLAND CORPORATION |
| `1000010111` | ANDES ROAD | GOVERNORS ISLAND CORPORATION |

**BBL: 1008350041**
NYC's unique property ID (Borough-Block-Lot). Borough 1 = Manhattan.

**Address: 5 AVENUE**
Street address of the property per NYC tax records.

**Owners (1):**
Number of ownership records found.

**ESRT EMPIRE STATE BUILDING, L.L.C.**
Legal name of the owner as recorded in NYC tax rolls.

**(TAX_ASSESSOR_OWNER)**
How ownership was recorded — `TAX_ASSESSOR_OWNER` means this comes from NYC's official tax assessment database.

**Owners route** (`/owners`):
- `ESRT EMPIRE STATE BUILDING, L.L.C.`
- `GOVERNORS ISLAND CORPORATION`
- `NYC PARKS DEPT`

**Owner: ESRT EMPIRE STATE BUILDING, L.L.C.**
Legal company name that owns the property.

**Properties (1):**
Total number of NYC properties this owner controls.

**1008350041**
BBL (unique NYC property ID) of the owned property.

**5 AVENUE**
Street address of that property.

**(TAX_ASSESSOR_OWNER)**
Ownership source — recorded in NYC's official tax assessment database.

**Graph route** (`/graph`):
- BBL: `1008350041`
- BBL: `1000010010`

**BBL: 1008350041**
The property being explored.

**Nodes (2) — properties and owners:**
Every entity in the ownership network.
- **[BBL] 1008350041 — 5 AVENUE** → the physical property
- **[OWNER] ESRT EMPIRE STATE BUILDING, L.L.C.** → the legal owner

**Edges (1) — ownership links:**
Connections between owners and properties.
- **Node 99109 —TAX_ASSESSOR_OWNER→ Node 98214** → the owner (99109) holds this property (98214) per NYC tax records

**Recommend route** (`/recommend`):
- BBL: `1008350041` → returns 5 similar Manhattan properties
- BBL: `1000010010`

**Query BBL: 1008350041**
The property you searched for (Empire State Building).

**Top 5 similar properties by ownership network:**
Properties whose ownership patterns most closely resemble your query property, ranked by similarity.

**BBL (e.g. 1008597501)**
NYC property ID of the similar property.

**Similarity distance (e.g. 0.2755)**
How similar the ownership pattern is — closer to 0.0 = nearly identical network structure, closer to 1.0 = very different. All results under 0.3 indicate strong similarity.

Similarity is based on **who owns what and how they connect** across all 97,000 NYC properties — not physical location or building type.

## Architecture
```
cat > README.md << 'EOF'
# NYC Real Estate Knowledge Graph

A fullstack knowledge graph application for exploring NYC property ownership networks, built with Remix, FastAPI, Neo4j, and GPU-trained ML embeddings.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
└──────────────────────┬──────────────────────────────────────┘
│ HTTP :3000
┌──────────────────────▼──────────────────────────────────────┐
│              Remix SSR Frontend (React Router v7)           │
│  routes: / | /properties | /owners | /graph | /recommend    │
└──────────────────────┬──────────────────────────────────────┘
│ HTTP :8000
┌──────────────────────▼──────────────────────────────────────┐
│                  FastAPI Backend (Python 3.11)              │
│  GET  /api/health                                           │
│  GET  /api/stats                                            │
│  GET  /api/properties/{bbl}                                 │
│  GET  /api/owners/{name}                                    │
│  GET  /api/recommend/{bbl}   ← node2vec embeddings          │
│  POST /api/graph/traverse                                   │
└──────────┬──────────────────────────────┬───────────────────┘
           │ bolt://7687                  │ numpy/sklearn
┌──────────▼──────────┐  ┌────────────────▼────────────────┐
│   Neo4j 5.26        │  │   GPU Training Results          │
│   Graph Database    │  │   GPU Cluster (4× NVIDIA L4)    │
│   BBL/OWNER nodes   │  │   23GB VRAM, CUDA 12.8          │
│   OWNS edges        │  │                                 │
└─────────────────────┘  │   outputs/embeddings/           │
                         │   ├── node2vec_emb.txt (97K)    │
                         │   ├── graphsage_emb.npy         │
                         │   └── graphsage_nodes.npy       │
                         │   outputs/models/               │
                         │   ├── transe/ (GMR: 5.06)       │
                         │   └── transr/ (GMR: 2482)       │
                         └─────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Remix / React Router v7, TailwindCSS, TypeScript |
| Backend | FastAPI, Python 3.11, scikit-learn |
| Graph DB | Neo4j 5.26 (local Docker), Neo4j AuraDB Free (production) |
| ML Models | PyKEEN (TransE/TransR), node2vec, GraphSAGE |
| GPU Hardware | 4× NVIDIA L4 (23GB VRAM each), CUDA 12.8 |
| Infra | Docker, docker-compose, Railway |
| Testing | pytest (100% coverage), vitest (80%+ coverage) |
| CI/CD | GitHub Actions (6 jobs) |

## GPU Training

Training was performed on a GPU cluster:

- **Hardware**: 4× NVIDIA L4 GPU (23GB VRAM each), CUDA 12.8, Driver 570.172.08
- **Notebook**: `gpu_training_results/notebooks/nyc_knowledge_graph_gpu.ipynb`
- **Pipeline**: 21 cells — data prep → deduplication → node2vec → TransE/TransR → GraphSAGE → KNN recommender

## Neo4j Database

| Environment | Connection |
|---|---|
| Local (Docker) | `bolt://localhost:7687` (neo4j:5.26 container) |
| Production | Neo4j AuraDB Free (`neo4j+s://3deb10fd.databases.neo4j.io`) |

Data is seeded via `cypher/seed_neo4j.py` — batch-loads 100K NYC tax records (BBL + OWNER nodes, TAX_ASSESSOR_OWNER relationships) into AuraDB using `MERGE` in batches of 1,000.

### Training Results

| Model | Metric | Value |
|---|---|---|
| TransE | Geometric Mean Rank | 5.06 |
| TransR | Geometric Mean Rank | 2482.08 |
| node2vec | Vocabulary Size | 97,189 nodes |
| GraphSAGE | Embedding Shape | (96,867, 8) |

## Data

- **Source**: NYC Tax Property Features (100K records, 139 columns)
- **Graph**: 172,658 nodes, 97,035 edges
- **Unique BBLs**: 96,867
- **Unique Owners**: 75,791 (after deduplication)

## Project Structure
```
manning-NewYorkCityRealEstateKnowledgeGraph/
├── backend/              # FastAPI app + tests (100% coverage)
├── frontend/             # Remix SSR app + tests (80%+ coverage)
│   └── app/routes/       # properties, owners, graph, recommend
├── cypher/               # Neo4j Cypher scripts (milestones 2 & 3)
├── gpu_training_results/ # GPU cluster outputs
│   ├── notebooks/        # GPU Jupyter notebook
│   └── outputs/          # embeddings, models, plots
├── .github/workflows/    # CI: backend, frontend, e2e, security, docker
├── Dockerfile            # Multi-stage: Node build + Python serve
└── docker-compose.yml    # app + neo4j services
```

## Git Workflow

GitFlow: `main` ← `develop` ← `feature/*`

## Local Development
```bash
# Backend
uv sync && uv run uvicorn backend.app:app --reload

# Frontend
cd frontend && npm install && npm run dev

# Full stack
docker compose up --build
```

## Milestones

| Milestone | Description | Status |
|---|---|---|
| 1 | Data ingestion & graph construction | ✅ |
| 2 | Owner deduplication & node2vec | ✅ |
| 3 | TransE/TransR KG embeddings + GraphSAGE | ✅ |
| 4 | FastAPI backend + Remix frontend | ✅ |
| 5 | React Native mobile app | ✅ |
| 6 | Railway deployment | ✅ |

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
