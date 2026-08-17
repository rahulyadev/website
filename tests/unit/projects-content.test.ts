import { describe, expect, it } from "vitest";

import { projectStatusSchema } from "../../app/content/content-schemas.server";
import { LocalContentAdapter } from "../../app/content/local-content-adapter.server";
import { isProjectSlug, PROJECT_SLUGS } from "../../app/domain/content";

const expectedProjects = [
  {
    slug: "tourney",
    name: "Tourney",
    destination: "tourney.rahuly.in",
    summary:
      "A flexible tournament manager for creating competitions, recording scores, calculating results, and announcing winners across different games and variants.",
    capabilities: [
      "Create a tournament for any game and variant.",
      "Configure competitors, matches, or rounds according to the chosen format.",
      "Record scores as the tournament progresses.",
      "Calculate standings and final results.",
      "Announce and display the winner.",
      "Keep active tournament views updated for organizers and participants.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "React",
      "PostgreSQL",
      "Redis",
      "WebSockets",
      "Docker",
    ],
    rationale:
      "FastAPI will provide the tournament APIs, React will power the organizer and participant views, PostgreSQL will store tournament data, and Redis with WebSockets will support responsive score and result updates.",
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    destination: "go.rahuly.in",
    summary:
      "A practical service for creating, managing, and safely redirecting short links. I plan to build it to revisit and deepen technologies in my stack—and I’d love for you to use it when it is ready. ❤️",
    capabilities: [
      "Create and manage shortened URLs.",
      "Redirect go.rahuly.in/{id} to its target URL.",
      "Validate destination URLs.",
      "Apply per-user and per-client rate limits.",
      "Cache frequently requested redirects.",
      "Provide a shared authentication foundation intended for Rahul’s applications.",
      "Use the project to revisit and strengthen selected technologies already represented in the portfolio.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "React",
      "PostgreSQL",
      "Redis",
      "JWT",
      "Docker",
    ],
    rationale:
      "FastAPI will handle link management and redirect APIs, PostgreSQL will store links and ownership data, Redis will support redirect caching and rate limiting, and React will provide the authenticated management interface.",
  },
  {
    slug: "portfolio-tracker",
    name: "Portfolio Tracker",
    destination: "invest.rahuly.in",
    summary:
      "A long-term investment journal and portfolio tracker for recording investment decisions, strategies, exit plans, alerts, prices, and performance.",
    capabilities: [
      "Record the reasoning behind an investment decision.",
      "Store the strategy and any decided exit conditions for each stock.",
      "Configure price or decision alerts.",
      "Retrieve current stock prices from an appropriate provider.",
      "Show invested value, current value, return percentage, and XIRR at stock level.",
      "Show the same meaningful indicators at overall portfolio level.",
      "Preserve a history of decisions instead of showing only the latest value.",
    ],
    stack: [
      "Python",
      "Django",
      "Django REST Framework",
      "React",
      "PostgreSQL",
      "Redis",
      "Celery",
      "RabbitMQ",
      "Docker",
    ],
    rationale:
      "Django and Django REST Framework suit the project’s structured financial domain and administrative workflows, PostgreSQL will store portfolio history, and Celery with RabbitMQ and Redis will support planned price refreshes, imports, and alerts.",
  },
  {
    slug: "universal-job-tracker",
    name: "Universal Job Tracker",
    destination: "jobs.rahuly.in",
    summary:
      "A compact job-application tracker with customizable columns and typed fields that can adapt to different job-search workflows.",
    capabilities: [
      "Track job applications and their relevant details.",
      "Add custom columns.",
      "Delete default columns.",
      "Configure column types including email, text, number, checkbox, and radio.",
      "Validate values according to their configured column type.",
      "Keep the primary workflow within one or two main screens.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "Vue.js",
      "PostgreSQL",
      "SQLAlchemy",
      "Pydantic",
      "Docker",
    ],
    rationale:
      "FastAPI, SQLAlchemy, and Pydantic will support typed configurable fields and validation, PostgreSQL will store flexible job records, and Vue.js will provide a compact editable tracking interface.",
  },
] as const;

describe("approved project content", () => {
  it("keeps exactly four public WIP plans in editorial order", async () => {
    const snapshot = await new LocalContentAdapter().load();

    expect(snapshot.projects).toHaveLength(4);
    expect(
      snapshot.projects.map(({ name, order, slug, status }) => ({
        name,
        order,
        slug,
        status,
      })),
    ).toEqual(
      expectedProjects.map(({ name, slug }, index) => ({
        name,
        order: (index + 1) * 10,
        slug,
        status: "wip",
      })),
    );
    expect(new Set(snapshot.projects.map((project) => project.slug)).size).toBe(
      4,
    );
    expect(snapshot.projects.map((project) => project.slug)).toEqual(
      PROJECT_SLUGS,
    );
    expect(PROJECT_SLUGS.every((slug) => isProjectSlug(slug))).toBe(true);
    expect(isProjectSlug("not-a-project")).toBe(false);
    expect(
      new Set(snapshot.projects.map((project) => project.order)).size,
    ).toBe(4);
  });

  it("preserves every approved summary, destination, capability, stack, and rationale", async () => {
    const snapshot = await new LocalContentAdapter().load();

    expect(
      snapshot.projects.map((project) => ({
        slug: project.slug,
        name: project.name,
        destination: project.plannedDestination,
        summary: project.summary,
        capabilities: project.plannedCapabilities.map(
          (capability) => capability.text,
        ),
        stack: project.plannedStack,
        rationale: project.stackRationale,
      })),
    ).toEqual(expectedProjects);

    for (const project of snapshot.projects) {
      expect(project.plannedStack.length).toBeGreaterThan(0);
      expect(new Set(project.plannedStack).size).toBe(
        project.plannedStack.length,
      );
    }
  });

  it("keeps short-link, later-possibility, and disclaimer fields restrained", async () => {
    const snapshot = await new LocalContentAdapter().load();
    const shortener = snapshot.projects[1];
    const portfolio = snapshot.projects[2];

    expect(shortener?.plannedShortLinkPattern).toBe("go.rahuly.in/{id}");
    expect(portfolio?.laterPossibilities.map(({ text }) => text)).toEqual([
      "Import spreadsheets exported by investment applications.",
      "Validate and map imported spreadsheet columns.",
      "Consider authorized portfolio-import APIs where suitable providers make this technically and legally possible.",
    ]);
    expect(portfolio?.disclaimer).toBe(
      "Planned as a personal decision-tracking tool, not investment advice.",
    );
    expect(
      snapshot.projects
        .filter((project) => project.slug !== "portfolio-tracker")
        .every(
          (project) =>
            project.laterPossibilities.length === 0 &&
            project.disclaimer === undefined,
        ),
    ).toBe(true);
  });

  it("accepts only the supported project-status values", () => {
    expect(
      ["wip", "beta", "live"].map(
        (status) => projectStatusSchema.safeParse(status).success,
      ),
    ).toEqual([true, true, true]);
    expect(projectStatusSchema.safeParse("planned").success).toBe(false);
  });
});
