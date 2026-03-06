#!/bin/bash
# start.sh
# Start FastAPI backend
uv run uvicorn backend.app:app --host 0.0.0.0 --port 8000 &
# Start Remix SSR server
cd /app/frontend && node_modules/.bin/react-router-serve ./build/server/index.js &
wait
