import { Fragment, useId, useState } from "react";

import type {
  HomeExperienceData,
  HomeTextSegmentData,
} from "../../domain/route-data";
import { OrganizationLogo } from "../organization-logo";
import { Section, SectionHeading } from "../ui";

const visibleContributionCount = 3;

function EmphasizedText({
  segments,
}: {
  readonly segments: readonly HomeTextSegmentData[];
}) {
  return segments.map((segment, index) =>
    segment.emphasized ? (
      <strong key={`${String(index)}-${segment.text}`}>{segment.text}</strong>
    ) : (
      <Fragment key={`${String(index)}-${segment.text}`}>
        {segment.text}
      </Fragment>
    ),
  );
}

function FeaturedExperienceIndicator() {
  const tooltipId = useId();

  return (
    <span
      aria-labelledby={tooltipId}
      className="experience-entry__featured"
      role="img"
      tabIndex={0}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="m12 3 2.42 4.9 5.41.78-3.91 3.81.92 5.39L12 15.34l-4.84 2.54.92-5.39-3.91-3.81 5.41-.78L12 3Z" />
      </svg>
      <span
        className="experience-entry__featured-tooltip"
        id={tooltipId}
        role="tooltip"
      >
        Featured experience
      </span>
    </span>
  );
}

function Contributions({
  contributions,
}: {
  contributions: HomeExperienceData["roles"][number]["contributions"];
}) {
  const additionalContributionsId = useId();
  const [expanded, setExpanded] = useState(false);
  const visible = contributions.slice(0, visibleContributionCount);
  const remaining = contributions.slice(visibleContributionCount);
  const contributionLabel =
    remaining.length === 1 ? "contribution" : "contributions";

  return (
    <div className="experience-role__contributions">
      <p className="professional-label">Selected contributions</p>
      <ol>
        {visible.map((contribution) => (
          <li
            className="home-prose"
            key={contribution.map((segment) => segment.text).join("")}
          >
            <EmphasizedText segments={contribution} />
          </li>
        ))}
      </ol>
      {remaining.length > 0 ? (
        <details open={expanded}>
          <summary
            aria-controls={additionalContributionsId}
            aria-expanded={expanded}
            onClick={(event) => {
              event.preventDefault();
              setExpanded((current) => !current);
            }}
            role="button"
          >
            {expanded ? "Hide" : "Show"} {remaining.length} more{" "}
            {contributionLabel}
          </summary>
          <ol
            id={additionalContributionsId}
            start={visibleContributionCount + 1}
          >
            {remaining.map((contribution) => (
              <li
                className="home-prose"
                key={contribution.map((segment) => segment.text).join("")}
              >
                <EmphasizedText segments={contribution} />
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}

function ExperienceEntry({ experience }: { experience: HomeExperienceData }) {
  return (
    <li className="experience-entry" data-featured={experience.featured}>
      <span aria-hidden="true" className="experience-entry__marker" />
      <div className="experience-entry__content">
        <div className="experience-entry__roles">
          {experience.roles.map((role, roleIndex) => (
            <article
              className="experience-role"
              key={`${role.title}-${role.dateRange}`}
            >
              {roleIndex === 0 ? (
                <header className="experience-entry__header">
                  <OrganizationLogo logo={experience.logo} />
                  <div className="experience-entry__identity-copy">
                    <h3>{experience.organization}</h3>
                    <div className="experience-role__title-row">
                      <h4>{role.title}</h4>
                      {experience.featured ? (
                        <FeaturedExperienceIndicator />
                      ) : null}
                    </div>
                  </div>
                  <div className="experience-role__metadata">
                    <p className="experience-role__dates">
                      <time>{role.dateRange}</time>
                    </p>
                    <p className="experience-role__location">{role.location}</p>
                  </div>
                </header>
              ) : (
                <header className="experience-role__header experience-role__header--nested">
                  <h4>{role.title}</h4>
                  <p className="experience-role__dates">
                    <time>{role.dateRange}</time>
                  </p>
                  <p className="experience-role__location">{role.location}</p>
                </header>
              )}
              {role.engagement === undefined ? null : (
                <p className="experience-role__engagement">
                  <span>{role.engagement.label}:</span>{" "}
                  {role.engagement.organization}
                </p>
              )}
              <p className="experience-role__summary home-prose">
                {role.summary}
              </p>
              <Contributions contributions={role.contributions} />
              <div className="experience-role__technologies">
                <p className="professional-label">Technologies</p>
                <ul>
                  {role.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </li>
  );
}

export function ExperienceSection({
  experiences,
}: {
  readonly experiences: readonly HomeExperienceData[];
}) {
  return (
    <Section className="home-experience professional-section" id="experience">
      <div className="home-section__inner">
        <SectionHeading
          description={
            <p className="home-prose">
              Reverse-chronological roles, selected responsibilities, and
              validated outcomes.
            </p>
          }
          eyebrow="Work"
          title="Experience"
        />
        <ol
          aria-label="Professional experience in reverse chronological order"
          className="experience-timeline"
        >
          {experiences.map((experience) => (
            <ExperienceEntry
              experience={experience}
              key={experience.organization}
            />
          ))}
        </ol>
      </div>
    </Section>
  );
}
