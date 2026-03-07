#!/bin/bash
# start.sh
uvicorn backend.app:app --host 0.0.0.0 --port 8001 &
sleep 2
cd /app/frontend && node server.js
