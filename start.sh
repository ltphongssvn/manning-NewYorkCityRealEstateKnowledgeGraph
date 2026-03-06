#!/bin/bash
# start.sh
uvicorn backend.app:app --host 0.0.0.0 --port 8000 &
cd /app/frontend && PORT=3000 node_modules/.bin/react-router-serve ./build/server/index.js &
nginx -g "daemon off;"
