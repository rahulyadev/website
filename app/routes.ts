import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("projects", "routes/projects.tsx"),
  route("projects/:slug", "routes/project-detail.tsx"),
  route("writings", "routes/writings.tsx"),
  route("writings/:slug", "routes/writing-detail.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
