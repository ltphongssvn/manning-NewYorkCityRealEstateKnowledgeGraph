# Dockerfile
# Stage 1: Build Remix frontend
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend + Remix SSR server
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir fastapi "uvicorn[standard]" neo4j numpy scikit-learn pydantic

COPY backend/ ./backend/
COPY gpu_training_results/outputs ./gpu_training_results/outputs

COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

COPY start.sh ./start.sh
RUN chmod +x ./start.sh
EXPOSE 8000 3000
CMD ["./start.sh"]
