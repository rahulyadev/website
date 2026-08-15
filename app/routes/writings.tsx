import { getContentRepository } from "../content/content.server";
import type { Route } from "./+types/writings";

export async function loader() {
  return getContentRepository().getPublishedWritings();
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

export default function Writings({ loaderData }: Route.ComponentProps) {
  return (
    <section aria-labelledby="writings-heading">
      <h1 id="writings-heading">Writings</h1>
      {loaderData.items.length === 0 ? (
        <p>No published writings are available yet.</p>
      ) : (
        <ul>
          {loaderData.items.map((writing) => (
            <li key={writing.metadata.id}>{writing.metadata.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
