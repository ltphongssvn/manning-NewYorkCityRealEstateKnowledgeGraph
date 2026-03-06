// frontend/app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("properties", "routes/properties.tsx"),
  route("owners", "routes/owners.tsx"),
  route("graph", "routes/graph.tsx"),
  route("recommend", "routes/recommend.tsx"),
] satisfies RouteConfig;
