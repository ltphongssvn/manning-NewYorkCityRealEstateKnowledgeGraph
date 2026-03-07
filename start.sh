#!/bin/bash
# start.sh
export APP_PORT=${PORT:-80}
sed -i "s/listen 80;/listen ${APP_PORT};/" /etc/nginx/nginx.conf
uvicorn backend.app:app --host 0.0.0.0 --port 8000 &
cd /app/frontend && PORT=3000 node_modules/.bin/react-router-serve ./build/server/index.js &
nginx -g "daemon off;"
