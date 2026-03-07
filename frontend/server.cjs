// frontend/server.cjs
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { createRequestHandler } = require("@react-router/express");
const path = require("path");

const app = express();

// Serve static assets from Remix build
app.use("/assets", express.static(path.join(__dirname, "build/client/assets")));
app.use(express.static(path.join(__dirname, "build/client")));

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
