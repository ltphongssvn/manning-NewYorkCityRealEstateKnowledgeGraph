#!/bin/bash
# start.sh - FastAPI on 8000, Remix SSR on 3000
uvicorn backend.app:app --host 0.0.0.0 --port 8000 &
cd /app/frontend && PORT=3000 node_modules/.bin/react-router-serve ./build/server/index.js &
wait
