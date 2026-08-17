import type { HomeEducationData } from "../../domain/route-data";
import { OrganizationLogo } from "../organization-logo";
import { Section, SectionHeading } from "../ui";

export function EducationSection({
  education,
}: {
  readonly education: readonly HomeEducationData[];
}) {
  return (
    <Section className="home-education professional-section" id="education">
      <div className="home-section__inner">
        <SectionHeading eyebrow="Education" title="Education" />
        <div className="education-list">
          {education.map((record) => (
            <article className="education-record" key={record.institution}>
              <OrganizationLogo logo={record.logo} />
              <div className="education-record__copy">
                <h3>
                  {record.credential} in {record.fieldOfStudy}
                </h3>
                <p className="education-record__institution">
                  {record.institution}
                </p>
                <p className="education-record__details">
                  {record.dateRange} <span aria-hidden="true">·</span>{" "}
                  {record.score}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
