import { useEffect, useRef } from "react";
import { LinkButton, Section, SectionHeading } from "@rahulyadev/design-system";

import type { HomePageData } from "../../domain/route-data";
import { ResponsivePicture } from "../responsive-picture";
import { useSiteShell } from "../site-shell/site-shell";
import { ContactActions } from "./contact-actions";
import { EducationSection } from "./education-section";
import { ExperienceSection } from "./experience-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";

type CredibilityCard = HomePageData["credibilityCards"][number];

export function CredibilityList({
  cards,
}: {
  readonly cards: readonly CredibilityCard[];
}) {
  return (
    <ol className="credibility-list">
      {cards.map((card, index) => (
        <li
          className={
            card.outcomes === undefined
              ? "credibility-list__item"
              : "credibility-list__item credibility-list__item--outcomes"
          }
          key={card.title}
        >
          <span aria-hidden="true" className="credibility-list__index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="credibility-list__copy">
            <h3 className="credibility-list__title">{card.title}</h3>
            {card.body === undefined ? null : (
              <p className="credibility-list__detail home-prose">{card.body}</p>
            )}
            {card.outcomes === undefined ? null : (
              <ul className="credibility-list__outcomes">
                {card.outcomes.map((outcome) => (
                  <li className="home-prose" key={outcome.label}>
                    <strong>{outcome.label}:</strong> {outcome.detail}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HomePage({ data }: { data: HomePageData }) {
  const heroRef = useRef<HTMLElement>(null);
  const { setHomeHeroVisible } = useSiteShell();

  useEffect(() => {
    const hero = heroRef.current;
    setHomeHeroVisible(true);

    if (hero === null || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHomeHeroVisible(Boolean(entry?.isIntersecting));
      },
      {
        rootMargin: "-80px 0px 0px",
        threshold: 0.05,
      },
    );
    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, [setHomeHeroVisible]);

  return (
    <div className="home-page">
      <section className="home-hero" ref={heroRef}>
        <div className="home-hero__portrait-frame">
          <ResponsivePicture
            fetchPriority="high"
            image={data.portrait}
            imageClassName="home-hero__portrait"
            loading="eager"
            sizes="clamp(9rem, 22vw, 18rem)"
          />
        </div>
        <div className="home-hero__copy">
          <h1>{data.identity.displayName}</h1>
          <p className="home-hero__eyebrow">{data.identity.roleLabel}</p>
          <p className="home-hero__positioning home-prose">
            {data.identity.professionalPositioning}
          </p>
          <div className="home-hero__actions">
            <LinkButton href="#contact" size="small">
              Contact me
            </LinkButton>
            <LinkButton
              download={data.resume.downloadName}
              href={data.resume.path}
              size="small"
              variant="secondary"
            >
              Download resume
            </LinkButton>
          </div>
        </div>
      </section>

      <Section className="home-about" id="about" spacing="spacious">
        <div className="home-section__inner">
          <SectionHeading
            eyebrow="About"
            title="Backend depth, full-stack delivery"
          />
          <div className="home-about__copy">
            <p className="home-prose">{data.identity.introduction}</p>
            <p className="home-prose">{data.identity.opportunityStatement}</p>
          </div>
        </div>
      </Section>

      <Section className="home-credibility" id="credibility">
        <div className="home-section__inner">
          <SectionHeading
            description={
              <p className="home-prose">
                Selected, validated indicators of engineering impact.
              </p>
            }
            eyebrow="Credibility"
            title="Evidence over adjectives"
          />
          <CredibilityList cards={data.credibilityCards} />
        </div>
      </Section>

      <ExperienceSection experiences={data.experiences} />

      <ProjectsSection projects={data.projects} />

      <SkillsSection skillGroups={data.skillGroups} />

      <EducationSection education={data.education} />

      <Section className="home-contact" id="contact" spacing="spacious">
        <div className="home-section__inner">
          <SectionHeading
            description={
              <p className="home-prose">
                For senior backend, senior software, and backend-heavy
                full-stack opportunities.
              </p>
            }
            eyebrow="Contact"
            title="Start a useful conversation"
          />
          <ContactActions
            contacts={data.contacts}
            location={data.location}
            resume={data.resume}
            socialLinks={data.socialLinks}
          />
        </div>
      </Section>
    </div>
  );
}
