import { HomePage } from "../components/home/home-page";
import { loadHomePageData } from "../content/portfolio-route-data.server";
import { JsonLd } from "../seo/json-ld";
import { buildPageMetadata } from "../seo/metadata";
import {
  profilePageStructuredData,
  websiteStructuredData,
} from "../seo/structured-data";
import type { Route } from "./+types/home";

export async function loader() {
  return loadHomePageData();
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  buildPageMetadata({
    canonicalOrigin: loaderData.canonicalOrigin,
    seo: loaderData.seo,
    openGraphType: "website",
    discoverFeed: true,
  });

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <JsonLd data={websiteStructuredData(loaderData)} />
      <JsonLd data={profilePageStructuredData(loaderData)} />
      <HomePage data={loaderData} />
    </>
  );
}
