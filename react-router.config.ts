import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  buildDirectory: "build",
  routeDiscovery: { mode: "initial" },
  ssr: false,
  prerender: ["/", "/projects", "/writings"],
} satisfies Config;
