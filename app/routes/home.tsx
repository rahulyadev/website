import { HomePage } from "../components/home/home-page";
import { loadHomePageData } from "../content/portfolio-route-data.server";
import type { Route } from "./+types/home";

export async function loader() {
  return loadHomePageData();
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  return [
    { title: loaderData.seo.title },
    { name: "description", content: loaderData.seo.description },
    {
      tagName: "link",
      rel: "canonical",
      href: new URL(loaderData.seo.canonicalPath, loaderData.canonicalOrigin)
        .href,
    },
  ];
};

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage data={loaderData} />;
}
