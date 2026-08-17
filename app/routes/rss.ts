import { loadRssXml } from "../content/writings-route-data.server";

export async function loader() {
  return new Response(await loadRssXml(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
