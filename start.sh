#!/bin/bash
# start.sh
APP_PORT=${PORT:-8080}
sed -i "s/RAILWAY_PORT/${APP_PORT}/" /etc/nginx/nginx.conf
uvicorn backend.app:app --host 0.0.0.0 --port 8001 &
cd /app/frontend && PORT=3000 node_modules/.bin/react-router-serve ./build/server/index.js &
sleep 2
nginx -g "daemon off;"
