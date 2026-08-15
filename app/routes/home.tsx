import { getContentRepository } from "../content/content.server";
import type { Route } from "./+types/home";

export async function loader() {
  const overview = await getContentRepository().getPortfolioOverview();

  return {
    identity: overview.identity,
    seo: overview.seo,
    canonicalOrigin: overview.canonicalOrigin,
  };
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
  return (
    <section aria-labelledby="home-heading">
      <h1 id="home-heading">{loaderData.identity.displayName}</h1>
      <p>{loaderData.identity.professionalPositioning}</p>
      <p>{loaderData.identity.introduction}</p>
    </section>
  );
}
