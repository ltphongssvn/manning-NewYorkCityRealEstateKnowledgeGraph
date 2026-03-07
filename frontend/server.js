// frontend/server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { createRequestHandler } = require("@react-router/express");

const app = express();

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8001",
    changeOrigin: false,
  })
);

app.use(
  createRequestHandler({
    build: require("./build/server/index.js"),
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
