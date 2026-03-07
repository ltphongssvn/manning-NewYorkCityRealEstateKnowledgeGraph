#!/bin/bash
# start.sh
APP_PORT=${PORT:-8080}
echo "Starting with PORT=${APP_PORT}"
sed -i "s/RAILWAY_PORT/${APP_PORT}/" /etc/nginx/nginx.conf
echo "nginx.conf after sed:"
cat /etc/nginx/nginx.conf
uvicorn backend.app:app --host 0.0.0.0 --port 8001 &
cd /app/frontend && PORT=3000 node_modules/.bin/react-router-serve ./build/server/index.js &
sleep 3
echo "Starting nginx on port ${APP_PORT}"
nginx -g "daemon off;" &
NGINX_PID=$!
echo "nginx PID: ${NGINX_PID}"
wait
