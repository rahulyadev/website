import type { Config } from "@react-router/dev/config";

import { getContentRepository } from "./app/content/content.server";

export default {
  appDirectory: "app",
  buildDirectory: "build",
  routeDiscovery: { mode: "initial" },
  ssr: false,
  async prerender() {
    const repository = getContentRepository();
    const [projectSlugs, writingSlugs] = await Promise.all([
      repository.getPublishedProjectSlugs(),
      repository.getPublishedWritingSlugs(),
    ]);

    return [
      "/",
      "/projects",
      "/writings",
      "/rss.xml",
      "/sitemap.xml",
      ...projectSlugs.map((slug) => `/projects/${slug}`),
      ...writingSlugs.map((slug) => `/writings/${slug}`),
    ];
  },
} satisfies Config;
