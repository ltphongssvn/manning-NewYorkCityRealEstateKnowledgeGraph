# Security Best Practices Implementation
# Project: Manning NYC Real Estate Knowledge Graph
# Stack: Python (FastAPI + Neo4j) backend, React (Vite) frontend, React Native mobile, Docker

## Secret Management Implementation

### 1. Pre-commit Secret Detection Setup

**Installation:**
```bash
pip install pre-commit detect-secrets
```

**Activation:**
```bash
detect-secrets scan > .secrets.baseline
pre-commit install
pre-commit install --hook-type pre-push
```

### 2. Environment Variables Required

Create `.env` file (never commit):
```bash
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password_here  # pragma: allowlist secret

# API Configuration
PORT=8000

# Railway Deployment
RAILWAY_ENVIRONMENT=production
```

### 3. Security Measures Implemented

| Layer | Tool/Practice | Purpose |
|-------|--------------|---------|
| Secret Detection | detect-secrets + pre-commit | Prevent secrets from entering codebase |
| .env Protection | pre-commit hook `check-env-files` | Block .env files from being committed |
| Binary Blocking | pre-commit hook `block-large-files` | Prevent large files (.h5, .pkl, .pth, .dump) from accidental commit |
| Neo4j Credentials | Environment variables only | Never hardcode DB credentials |
| Python Dependencies | `uv audit` / pip-audit | Scan for vulnerable Python packages |
| JS Dependencies | `npm audit` | Scan for vulnerable npm packages |
| CORS | FastAPI CORSMiddleware | Restrict cross-origin requests |
| Input Validation | FastAPI type hints + Pydantic | Validate all request payloads |
| Docker Isolation | Multi-stage Dockerfile | Minimal production image, no dev tools |
| Type Safety | TypeScript strict mode (frontend) | Catch errors at compile time |
| Test Coverage | pytest + vitest (80% per-file min) | Prevent regressions, enforced via pre-push hooks |

### 4. FastAPI-Specific Security Notes

- **CORS:** Currently `allow_origins=["*"]` for development. Restrict to specific domains in production
- **Neo4j Auth:** Credentials passed via environment variables, never in source code
- **No Auth Required:** Demo project; add JWT/OAuth if deploying for real users
- **Query Safety:** Use parameterized Cypher queries to prevent injection attacks
- **Graph Data:** NYC public data only — no PII beyond what is in public records

### 5. Pre-commit Workflow

Every commit automatically:
1. Scans for secrets using detect-secrets
2. Blocks commit if new secrets found
3. Blocks .env files from being committed
4. Blocks large binary files (.h5, .pkl, .pth, .onnx, .dump)
5. Validates JSON and YAML files
6. Fixes line endings and trailing whitespace
7. Runs pytest (backend) quick tests
8. Runs vitest (frontend) quick tests

Every push automatically:
1. Runs pytest with coverage enforcement (80% per-file minimum)
2. Runs vitest with coverage enforcement (80% per-file minimum)

### 6. GitHub Actions CI

On every push/merge to main:
1. Backend: pytest with coverage report
2. Frontend: vitest with coverage report
3. Neo4j integration: Cypher query tests against service container
4. Security: detect-secrets scan
5. Docker: build verification

### 7. Team Guidelines

- Never commit `.env` files
- Never hardcode Neo4j credentials in Cypher scripts or notebooks
- Use environment variables for all credentials
- Run `pre-commit install && pre-commit install --hook-type pre-push` after cloning
- Review `.secrets.baseline` changes carefully
- Rotate any accidentally exposed keys immediately
- Run `uv audit` and `npm audit` regularly
- Keep all dependencies updated
- Restrict CORS origins before production deployment
- Never commit Neo4j `.dump` database files (may contain sensitive ownership data)

### 8. Dependency Security Audit
```bash
# Python: check for known vulnerabilities
uv audit

# JavaScript: check for known vulnerabilities
cd frontend && npm audit

# Fix automatically where possible
npm audit fix
```

## Verification
```bash
# Run all pre-commit hooks
$ pre-commit run --all-files

# Expected output:
Detect secrets...........................................................Passed
Block Large Binary Files.................................................Passed
Block .env Files.........................................................Passed
Verify Selective Staging.................................................Passed
Fix Line Endings to LF..................................................Passed
Fix End of Files.........................................................Passed
Trim Trailing Whitespace.................................................Passed
Validate JSON Files......................................................Passed
Validate YAML Files......................................................Passed
Check for Large Files....................................................Passed
Pytest Quick Tests (Backend).............................................Passed
Vitest Quick Tests (Frontend)............................................Passed
```

All secrets removed and pre-commit/pre-push protection active.
