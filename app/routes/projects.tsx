import { ProjectCard } from "../components/projects/project-card";
import { loadProjectsPageData } from "../content/portfolio-route-data.server";
import type { Route } from "./+types/projects";

export async function loader() {
  return loadProjectsPageData();
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
    <section
      aria-labelledby="projects-heading"
      className="projects-page projects-index"
    >
      <header className="projects-page__header">
        <p className="projects-page__eyebrow">PROJECT ROADMAP</p>
        <h1 id="projects-heading">Projects</h1>
        <p className="projects-page__introduction home-prose">
          A working roadmap of useful products I plan to build. Every project is
          currently marked WIP and will be updated as real functionality ships.
        </p>
      </header>
      <div className="project-card-grid">
        {loaderData.items.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
