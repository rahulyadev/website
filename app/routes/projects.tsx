import { getContentRepository } from "../content/content.server";
import type { Route } from "./+types/projects";

export async function loader() {
  return getContentRepository().getPublishedProjects();
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

export default function Projects({ loaderData }: Route.ComponentProps) {
  return (
    <section aria-labelledby="projects-heading">
      <h1 id="projects-heading">Projects</h1>
      {loaderData.items.length === 0 ? (
        <p>No published projects are available yet.</p>
      ) : (
        <ul>
          {loaderData.items.map((project) => (
            <li key={project.id}>{project.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
