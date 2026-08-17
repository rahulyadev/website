import { data, Link } from "react-router";

import { NotFoundPage } from "../components/not-found-page";
import { ProjectMark } from "../components/projects/project-mark";
import {
  PlannedStack,
  ProjectSummary,
} from "../components/projects/project-card";
import { ProjectStatusBadge } from "../components/projects/project-status-badge";
import { loadProjectDetailPageData } from "../content/portfolio-route-data.server";
import { isProjectSlug } from "../domain/content";
import type { Route } from "./+types/project-detail";

const workInProgressNotice =
  "Work in progress — development has not started yet. This page describes the intended direction, not shipped functionality.";

export async function loader({
  params,
}: {
  readonly params: { readonly slug?: string | undefined };
}) {
  const lookup = await loadProjectDetailPageData(params.slug ?? "");

  return lookup.kind === "not-found" ? data(lookup, { status: 404 }) : lookup;
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  if (!isProjectSlug(params.slug)) {
    return { kind: "not-found" as const, requestedSlug: params.slug };
  }

  return serverLoader();
}

function projectMeta(
  loaderData: Route.MetaArgs["loaderData"] | undefined,
): ReturnType<Route.MetaFunction> {
  // Static hosts can reach this route through the SPA fallback before a
  // matching route-data file exists, so error metadata must tolerate the
  // runtime's absent loader payload even though generated route types do not.
  if (loaderData === undefined || loaderData.kind === "not-found") {
    return [
      { title: "Page not found | Rahul Yadav" },
      { name: "robots", content: "noindex,follow" },
    ];
  }

  const { canonicalOrigin, project } = loaderData.data;

  return [
    { title: project.seo.title },
    { name: "description", content: project.seo.description },
    {
      tagName: "link",
      rel: "canonical",
      href: new URL(project.seo.canonicalPath, canonicalOrigin).href,
    },
    ...(project.status === "wip"
      ? [{ name: "robots", content: "noindex,follow" }]
      : []),
  ];
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  projectMeta(loaderData);

function renderProjectDetail(
  loaderData: Route.ComponentProps["loaderData"] | undefined,
) {
  if (loaderData === undefined || loaderData.kind === "not-found") {
    return <NotFoundPage />;
  }

  const { nextProject, previousProject, project } = loaderData.data;

  return (
    <article className="projects-page project-detail">
      <nav aria-label="Breadcrumb" className="project-breadcrumbs">
        <ol>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/projects">Projects</Link>
          </li>
          <li aria-current="page">{project.name}</li>
        </ol>
      </nav>

      <header className="project-detail__hero">
        <div className="project-detail__mark-area">
          <ProjectMark mark={project.projectMark} />
        </div>
        <div className="project-detail__hero-copy">
          <div className="project-detail__title-row">
            <h1>{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <ProjectSummary
            className="project-detail__summary home-prose"
            summary={project.summary}
          />
          <dl className="project-detail__destination">
            <div>
              <dt>Planned home</dt>
              <dd>{project.plannedDestination}</dd>
            </div>
            {project.plannedShortLinkPattern === undefined ? null : (
              <div>
                <dt>Planned short-link pattern</dt>
                <dd>{project.plannedShortLinkPattern}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <p className="project-detail__notice" role="note">
        {workInProgressNotice}
      </p>

      <div className="project-detail__content">
        <section aria-labelledby="project-capabilities-heading">
          <p className="project-section-number" aria-hidden="true">
            01
          </p>
          <div>
            <h2 id="project-capabilities-heading">What I plan to build</h2>
            <ul className="project-capability-list">
              {project.plannedCapabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="project-stack-heading">
          <p className="project-section-number" aria-hidden="true">
            02
          </p>
          <div className="project-detail__stack-copy">
            <h2 id="project-stack-heading">Planned stack</h2>
            <PlannedStack technologies={project.plannedStack} />
            <p className="home-prose">{project.stackRationale}</p>
          </div>
        </section>

        {project.laterPossibilities.length === 0 ? null : (
          <section aria-labelledby="project-possibilities-heading">
            <p className="project-section-number" aria-hidden="true">
              03
            </p>
            <div>
              <h2 id="project-possibilities-heading">Later possibilities</h2>
              <ul className="project-capability-list">
                {project.laterPossibilities.map((possibility) => (
                  <li key={possibility}>{possibility}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {project.disclaimer === undefined ? null : (
          <aside className="project-detail__disclaimer">
            <p>{project.disclaimer}</p>
          </aside>
        )}
      </div>

      <nav aria-label="Project plans" className="project-detail__navigation">
        <div className="project-detail__siblings">
          {previousProject === undefined ? (
            <span />
          ) : (
            <Link to={previousProject.path}>
              <span>← Previous project</span>
              <strong>{previousProject.name}</strong>
            </Link>
          )}
          {nextProject === undefined ? (
            <span />
          ) : (
            <Link to={nextProject.path}>
              <span>Next project →</span>
              <strong>{nextProject.name}</strong>
            </Link>
          )}
        </div>
        <Link className="project-detail__all-link" to="/projects">
          Back to all projects
        </Link>
      </nav>
    </article>
  );
}

export default function ProjectDetail({ loaderData }: Route.ComponentProps) {
  return renderProjectDetail(loaderData);
}
