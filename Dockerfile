# Dockerfile
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y nodejs npm nginx && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" neo4j numpy scikit-learn pydantic

COPY backend/ ./backend/
COPY gpu_training_results/outputs ./gpu_training_results/outputs
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
EXPOSE 80
CMD ["./start.sh"]
