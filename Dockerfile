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

# Install Node for Remix SSR server
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY pyproject.toml uv.lock .python-version ./
RUN pip install --no-cache-dir uv && uv sync --no-dev

# Copy backend
COPY backend/ ./backend/
COPY gpu_training_results/outputs ./gpu_training_results/outputs

# Copy Remix build + node_modules for SSR
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

ENV PORT=8000
EXPOSE 8000 3000

# Start script runs both FastAPI and Remix
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
CMD ["./start.sh"]
