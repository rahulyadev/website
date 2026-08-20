import { Link } from "react-router";
import { Section, SectionHeading } from "@rahulyadev/design-system";

import type { ProjectCardData } from "../../domain/route-data";
import { ProjectCard } from "../projects/project-card";

export function ProjectsSection({
  projects,
}: {
  readonly projects: readonly ProjectCardData[];
}) {
  return (
    <Section className="home-projects" id="projects">
      <div className="home-section__inner">
        <SectionHeading
          description={
            <p className="home-prose">
              A small set of practical products I plan to build and document as
              they move from idea to working software.
            </p>
          }
          eyebrow="PROJECTS"
          title="What I’m building next"
        />
        <div className="project-card-grid">
          {projects.map((project) => (
            <ProjectCard
              headingLevel={3}
              key={project.slug}
              project={project}
            />
          ))}
        </div>
        <Link className="projects-explore-link" to="/projects">
          Explore all project plans <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Section>
  );
}
