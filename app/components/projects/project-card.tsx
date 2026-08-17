import { Link } from "react-router";

import type { ProjectCardData } from "../../domain/route-data";
import { Card } from "../ui";
import { ProjectMark } from "./project-mark";
import { ProjectStatusBadge } from "./project-status-badge";

const accessibleHeartSuffix = " ❤️";

export function ProjectSummary({
  className,
  summary,
}: {
  readonly className?: string;
  readonly summary: string;
}) {
  if (!summary.endsWith(accessibleHeartSuffix)) {
    return <p className={className}>{summary}</p>;
  }

  return (
    <p className={className}>
      {summary.slice(0, -accessibleHeartSuffix.length)}{" "}
      <span aria-label="love" role="img">
        ❤️
      </span>
    </p>
  );
}

export function PlannedStack({
  technologies,
}: {
  readonly technologies: readonly string[];
}) {
  return (
    <ul className="planned-stack-list">
      {technologies.map((technology) => (
        <li key={technology}>{technology}</li>
      ))}
    </ul>
  );
}

export function ProjectCard({
  headingLevel = 2,
  project,
}: {
  readonly headingLevel?: 2 | 3;
  readonly project: ProjectCardData;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = `project-${project.slug}-heading`;

  return (
    <Card
      aria-labelledby={headingId}
      className="project-card"
      data-project={project.slug}
      padding="compact"
    >
      <div className="project-card__mark-area">
        <ProjectMark mark={project.projectMark} />
      </div>
      <div className="project-card__body">
        <header className="project-card__header">
          <Heading id={headingId}>{project.name}</Heading>
          <ProjectStatusBadge status={project.status} />
        </header>
        <ProjectSummary
          className="project-card__summary home-prose"
          summary={project.summary}
        />
        <div className="project-card__stack">
          <p className="project-label">Planned stack</p>
          <PlannedStack technologies={project.plannedStack} />
        </div>
        <dl className="project-card__destination">
          <dt>Planned home</dt>
          <dd>{project.plannedDestination}</dd>
        </dl>
        <Link
          aria-label={`View project plan for ${project.name}`}
          className="project-card__link"
          to={`/projects/${project.slug}`}
        >
          View project plan
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  );
}
