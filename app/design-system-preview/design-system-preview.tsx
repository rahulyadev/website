import type { CSSProperties, ReactNode } from "react";

import {
  Badge,
  Button,
  Card,
  Container,
  IconButton,
  LinkButton,
  Section,
  SectionHeading,
  SkipLink,
  ThemeToggle,
  VisuallyHidden,
} from "../components/ui";
import { useTheme } from "../theme";

interface Swatch {
  label: string;
  token: string;
}

const swatches: Swatch[] = [
  { label: "Canvas", token: "--color-canvas" },
  { label: "Surface", token: "--color-surface" },
  { label: "Raised", token: "--color-surface-raised" },
  { label: "Subtle", token: "--color-surface-subtle" },
  { label: "Strong ink", token: "--color-text-strong" },
  { label: "Muted ink", token: "--color-text-muted" },
  { label: "Accent", token: "--color-accent" },
  { label: "Accent soft", token: "--color-accent-soft" },
  { label: "Border", token: "--color-border" },
  { label: "Focus", token: "--color-focus-ring" },
];

const spacingTokens = [
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-6",
  "--space-8",
  "--space-12",
  "--space-16",
] as const;

function PreviewIcon({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DesignSystemPreview() {
  const { effectiveTheme, preference } = useTheme();

  return (
    <div className="design-preview">
      <SkipLink targetId="design-preview-main" />

      <header className="design-preview__header">
        <Container>
          <div className="design-preview__header-inner">
            <div className="design-preview__identity">
              <span aria-hidden="true" className="design-preview__mark">
                RY
              </span>
              <div>
                <p>Design system / 01</p>
                <span>Milestone 4 approval preview</span>
              </div>
            </div>

            <div className="design-preview__theme-control">
              <span className="design-preview__theme-status">
                <span aria-hidden="true" />
                {preference} · {effectiveTheme}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </header>

      <main
        className="design-preview__main"
        id="design-preview-main"
        tabIndex={-1}
      >
        <Section className="design-preview__hero" spacing="spacious">
          <Container>
            <div className="design-preview__hero-grid">
              <div className="design-preview__hero-copy">
                <Badge variant="accent">Temporary local preview</Badge>
                <p className="design-preview__kicker">
                  Editorial clarity <span aria-hidden="true">×</span>{" "}
                  engineering precision
                </p>
                <h1>Make complex work feel inevitable.</h1>
                <p className="design-preview__lede">
                  A composed visual language for explaining systems, decisions,
                  and outcomes without turning the portfolio into a dashboard.
                </p>
                <div className="design-preview__actions">
                  <LinkButton href="#components">Explore components</LinkButton>
                  <LinkButton href="#editorial" variant="secondary">
                    Read the specimen
                  </LinkButton>
                </div>
              </div>

              <aside
                aria-label="Design direction notes"
                className="design-preview__manifesto"
              >
                <p>System note</p>
                <ol>
                  <li>
                    <span>01</span>
                    Warm surfaces reduce glare and keep long-form reading calm.
                  </li>
                  <li>
                    <span>02</span>
                    Serif display type brings an editorial voice; mono labels
                    carry technical structure.
                  </li>
                  <li>
                    <span>03</span>
                    Blue marks decisions and actions, never decoration.
                  </li>
                </ol>
              </aside>
            </div>
          </Container>
        </Section>

        <Section className="design-preview__ruled-section" id="foundations">
          <Container>
            <SectionHeading
              description={
                <p>
                  Semantic roles stay stable while their values adapt across
                  light, dark, system, and reduced-motion preferences.
                </p>
              }
              eyebrow="01 / Foundations"
              title="A quiet palette with a clear signal."
            />

            <div className="design-preview__swatches">
              {swatches.map((swatch) => (
                <div className="design-preview__swatch" key={swatch.token}>
                  <span
                    aria-hidden="true"
                    className="design-preview__swatch-color"
                    style={
                      {
                        "--preview-swatch": `var(${swatch.token})`,
                      } as CSSProperties
                    }
                  />
                  <strong>{swatch.label}</strong>
                  <code>{swatch.token}</code>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="design-preview__ruled-section" id="typography">
          <Container>
            <SectionHeading
              description={
                <p>
                  Fluid sizing keeps hierarchy intact from a narrow handset to a
                  wide editorial canvas, using only resilient system stacks.
                </p>
              }
              eyebrow="02 / Typography"
              title="Voice before volume."
            />

            <div className="design-preview__type-grid">
              <div className="design-preview__type-display">
                <span>Display / fluid</span>
                <p>Systems, considered.</p>
              </div>
              <div className="design-preview__type-specimens">
                <div>
                  <span>Heading 1</span>
                  <p data-type="h1">Technical judgment at human scale.</p>
                </div>
                <div>
                  <span>Heading 2</span>
                  <p data-type="h2">Decisions need context.</p>
                </div>
                <div>
                  <span>Body large</span>
                  <p data-type="body-large">
                    Good engineering communication makes the path legible:
                    constraints, choices, trade-offs, and what changed next.
                  </p>
                </div>
                <div>
                  <span>Mono label</span>
                  <p data-type="mono">ASYNC BOUNDARY · STATIC OUTPUT · v1.0</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="design-preview__ruled-section" id="layout">
          <Container>
            <SectionHeading
              description={
                <p>
                  Twelve columns, fluid gutters, a 68-character reading measure,
                  and section rhythm that expands without becoming sparse.
                </p>
              }
              eyebrow="03 / Layout & rhythm"
              title="Structure you can feel, not see."
            />

            <div
              aria-label="Twelve-column grid example"
              className="design-preview__grid-demo"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index}>{String(index + 1).padStart(2, "0")}</span>
              ))}
            </div>

            <div className="design-preview__layout-examples">
              <Card as="div" padding="compact" variant="subtle">
                <p className="design-preview__spec-label">Reading measure</p>
                <p>
                  Long-form text stops at a deliberate measure so the eye can
                  travel comfortably, even when the surrounding grid grows wide.
                </p>
              </Card>

              <div className="design-preview__spacing-scale">
                <p className="design-preview__spec-label">Spacing scale</p>
                {spacingTokens.map((token) => (
                  <div key={token}>
                    <code>{token}</code>
                    <span
                      aria-hidden="true"
                      style={
                        {
                          "--preview-space": `var(${token})`,
                        } as CSSProperties
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section
          className="design-preview__ruled-section"
          id="components"
          spacing="spacious"
        >
          <Container>
            <SectionHeading
              description={
                <p>
                  A deliberately small primitive layer. Native controls,
                  consistent focus, token-led variants, and 44-pixel targets do
                  the work.
                </p>
              }
              eyebrow="04 / Components"
              title="Useful states, no theatre."
            />

            <div className="design-preview__component-grid">
              <Card as="section" aria-labelledby="preview-buttons-heading">
                <h3 id="preview-buttons-heading">Buttons</h3>
                <p>
                  Primary actions stay scarce. Secondary and ghost variants
                  recede.
                </p>
                <div className="design-preview__component-row">
                  <Button>Primary action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button disabled>Disabled</Button>
                </div>
                <div className="design-preview__component-row">
                  <LinkButton href="#editorial" size="small">
                    Small link button
                  </LinkButton>
                  <LinkButton
                    href="#foundations"
                    size="large"
                    variant="secondary"
                  >
                    Large link button
                  </LinkButton>
                </div>
              </Card>

              <Card
                as="section"
                aria-labelledby="preview-focus-heading"
                variant="raised"
              >
                <h3 id="preview-focus-heading">Focus & icon actions</h3>
                <p>
                  Press Tab to inspect the real focus order. The first sample
                  also shows the approved ring at rest.
                </p>
                <div className="design-preview__component-row">
                  <Button
                    className="design-preview__forced-focus"
                    variant="secondary"
                  >
                    Focus sample
                  </Button>
                  <IconButton aria-label="Copy example">
                    <PreviewIcon>
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <rect height="12" rx="1.5" width="12" x="8" y="8" />
                        <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-10A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17H8" />
                      </svg>
                    </PreviewIcon>
                  </IconButton>
                  <IconButton aria-label="Open details" variant="ghost">
                    <PreviewIcon>
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </PreviewIcon>
                  </IconButton>
                  <IconButton aria-label="Unavailable action" disabled>
                    <PreviewIcon>
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M12 8v4M12 16h.01" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </PreviewIcon>
                  </IconButton>
                </div>
              </Card>

              <Card
                as="section"
                aria-labelledby="preview-badges-heading"
                variant="subtle"
              >
                <h3 id="preview-badges-heading">Badges</h3>
                <p>Metadata is compact, never cryptic.</p>
                <div className="design-preview__component-row">
                  <Badge>Backend</Badge>
                  <Badge variant="accent">Featured</Badge>
                  <Badge variant="positive">Published</Badge>
                </div>
              </Card>

              <Card as="section" aria-labelledby="preview-theme-heading">
                <h3 id="preview-theme-heading">Theme preference</h3>
                <p>
                  Arrow keys move through the three explicit modes. System
                  tracks operating-system changes live.
                </p>
                <ThemeToggle aria-label="Preview theme preference" />
              </Card>
            </div>
          </Container>
        </Section>

        <Section
          className="design-preview__editorial"
          id="editorial"
          spacing="spacious"
        >
          <Container>
            <article className="design-preview__article">
              <header className="design-preview__article-header">
                <div>
                  <p className="design-preview__kicker">
                    Representative editorial block
                  </p>
                  <h2>A design system is a set of promises.</h2>
                </div>
                <dl>
                  <div>
                    <dt>Reading time</dt>
                    <dd>4 min</dd>
                  </div>
                  <div>
                    <dt>Discipline</dt>
                    <dd>Architecture</dd>
                  </div>
                </dl>
              </header>

              <div className="design-preview__article-grid">
                <div className="design-preview__article-body">
                  <p className="design-preview__drop-cap">
                    The useful promise is not that every screen will look the
                    same. It is that every decision begins from the same
                    language: readable type, predictable space, accessible
                    controls, and a clear relationship between emphasis and
                    meaning.
                  </p>
                  <p>
                    That language gives product work room to evolve. A case
                    study can become dense without becoming noisy. A technical
                    article can carry code and diagrams without losing its
                    reading rhythm. A call to action can be unmistakable without
                    becoming loud.
                  </p>
                  <blockquote>
                    <p>
                      Precision is not austerity. It is the confidence to leave
                      only what helps the reader understand.
                    </p>
                  </blockquote>
                  <h3>Designed for extension</h3>
                  <p>
                    The tokens describe roles instead of pages. The primitives
                    own behavior instead of business content. Future sections
                    can compose both without bypassing the accessibility
                    foundation.
                  </p>
                </div>

                <aside className="design-preview__article-aside">
                  <p className="design-preview__spec-label">Decision record</p>
                  <ol>
                    <li>
                      <span>Type</span>
                      Editorial serif display, neutral system sans body, mono
                      labels.
                    </li>
                    <li>
                      <span>Color</span>
                      Warm neutrals plus one semantic blue action family.
                    </li>
                    <li>
                      <span>Motion</span>
                      Short, interruptible transitions that collapse under
                      reduced motion.
                    </li>
                  </ol>
                </aside>
              </div>
            </article>
          </Container>
        </Section>
      </main>

      <footer className="design-preview__footer">
        <Container>
          <div>
            <p>
              Temporary approval surface · <code>?preview=design-system</code>
            </p>
            <p>
              <VisuallyHidden>Current effective theme: </VisuallyHidden>
              {effectiveTheme} theme
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
