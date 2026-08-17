import { loadSitemapXml } from "../content/writings-route-data.server";

export async function loader() {
  return new Response(await loadSitemapXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
