import type { ReactNode } from "react";
import { Section, SectionHeading } from "@rahulyadev/design-system";

import type { SkillGroupCategory } from "../../domain/content";
import type { HomeSkillGroupData } from "../../domain/route-data";

function SkillCategoryIcon({ category }: { category: SkillGroupCategory }) {
  const paths: Record<SkillGroupCategory, ReactNode> = {
    languages: (
      <>
        <path d="m9 6-5 6 5 6" />
        <path d="m15 6 5 6-5 6" />
      </>
    ),
    backend: (
      <>
        <rect height="5" rx="1" width="18" x="3" y="4" />
        <rect height="5" rx="1" width="18" x="3" y="15" />
        <path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6" />
      </>
    ),
    frontend: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <path d="M3 9h18M9 9v11" />
      </>
    ),
    data: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
      </>
    ),
    cloud: (
      <path d="M6.5 19a4.5 4.5 0 0 1-.7-8.94A6.5 6.5 0 0 1 18.4 9.4 4.8 4.8 0 0 1 18 19Z" />
    ),
    tooling: (
      <>
        <path d="m14.5 6.5 3-3a5 5 0 0 1-6.2 6.2l-7 7a2.1 2.1 0 0 0 3 3l7-7a5 5 0 0 0 6.2-6.2l-3 3Z" />
        <path d="m5.8 17.8.01.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="skill-group__icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      {paths[category]}
    </svg>
  );
}

export function SkillsSection({
  skillGroups,
}: {
  readonly skillGroups: readonly HomeSkillGroupData[];
}) {
  return (
    <Section className="home-skills professional-section" id="skills">
      <div className="home-section__inner">
        <SectionHeading
          description={
            <p className="home-prose">
              Backend-heavy full-stack technologies and engineering practices.
            </p>
          }
          eyebrow="Capabilities"
          title="Skills"
        />
        <div className="skill-groups">
          {skillGroups.map((group) => (
            <section className="skill-group" key={group.category}>
              <div className="skill-group__heading">
                <SkillCategoryIcon category={group.category} />
                <h3>{group.name}</h3>
              </div>
              <ul className="skill-group__skills">
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
