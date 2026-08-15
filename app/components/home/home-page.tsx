import { useEffect, useRef } from "react";

import type { HomePageData } from "../../domain/route-data";
import { ResponsivePicture } from "../responsive-picture";
import { LinkButton, Section, SectionHeading } from "../ui";
import { useSiteShell } from "../site-shell/site-shell";
import { ContactActions } from "./contact-actions";

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
            sizes="(min-width: 64rem) 38vw, (min-width: 48rem) 42vw, 12rem"
          />
        </div>
        <div className="home-hero__copy">
          <h1>{data.identity.displayName}</h1>
          <p className="home-hero__eyebrow">{data.identity.roleLabel}</p>
          <p className="home-hero__positioning">
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
        <SectionHeading
          eyebrow="About"
          title="Backend depth, full-stack delivery"
        />
        <div className="home-about__copy">
          <p>{data.identity.introduction}</p>
          <p>{data.identity.opportunityStatement}</p>
        </div>
      </Section>

      <Section className="home-credibility" id="credibility">
        <SectionHeading
          description={
            <p>Selected, validated indicators of engineering impact.</p>
          }
          eyebrow="Credibility"
          title="Evidence over adjectives"
        />
        <ol className="credibility-list">
          {data.credibilityHighlights.map((highlight, index) => (
            <li key={highlight.lead}>
              <span aria-hidden="true" className="credibility-list__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="credibility-list__copy">
                <p className="credibility-list__lead">{highlight.lead}</p>
                <p className="credibility-list__detail">{highlight.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="home-contact" id="contact" spacing="spacious">
        <SectionHeading
          description={
            <p>
              For senior backend, senior software, and backend-heavy full-stack
              opportunities.
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
      </Section>
    </div>
  );
}
