import { PROJECT_SLUG, type ProjectRecord } from "../../domain/content";

export const projectsContent = [
  {
    id: "project-tourney",
    slug: PROJECT_SLUG.tourney,
    name: "Tourney",
    publicationStatus: "published",
    status: "wip",
    order: 10,
    plannedDestination: "tourney.rahuly.in",
    summary:
      "A flexible tournament manager for creating competitions, recording scores, calculating results, and announcing winners across different games and variants.",
    plannedCapabilities: [
      {
        id: "capability-tourney-create",
        order: 10,
        text: "Create a tournament for any game and variant.",
      },
      {
        id: "capability-tourney-configure",
        order: 20,
        text: "Configure competitors, matches, or rounds according to the chosen format.",
      },
      {
        id: "capability-tourney-scores",
        order: 30,
        text: "Record scores as the tournament progresses.",
      },
      {
        id: "capability-tourney-results",
        order: 40,
        text: "Calculate standings and final results.",
      },
      {
        id: "capability-tourney-winner",
        order: 50,
        text: "Announce and display the winner.",
      },
      {
        id: "capability-tourney-updates",
        order: 60,
        text: "Keep active tournament views updated for organizers and participants.",
      },
    ],
    plannedStack: [
      "Python",
      "FastAPI",
      "React",
      "PostgreSQL",
      "Redis",
      "WebSockets",
      "Docker",
    ],
    homeStack: ["FastAPI", "React", "PostgreSQL", "Redis"],
    stackRationale:
      "FastAPI will provide the tournament APIs, React will power the organizer and participant views, PostgreSQL will store tournament data, and Redis with WebSockets will support responsive score and result updates.",
    laterPossibilities: [],
    featuredOnHome: true,
    projectMark: PROJECT_SLUG.tourney,
    seo: {
      title: "Tourney — Work in progress | Rahul Yadav",
      description:
        "A flexible tournament manager for creating competitions, recording scores, calculating results, and announcing winners across different games and variants.",
      canonicalPath: "/projects/tourney",
    },
  },
  {
    id: "project-url-shortener",
    slug: PROJECT_SLUG.urlShortener,
    name: "URL Shortener",
    publicationStatus: "published",
    status: "wip",
    order: 20,
    plannedDestination: "go.rahuly.in",
    plannedShortLinkPattern: "go.rahuly.in/{id}",
    summary:
      "A practical service for creating, managing, and safely redirecting short links. I plan to build it to revisit and deepen technologies in my stack—and I’d love for you to use it when it is ready. ❤️",
    plannedCapabilities: [
      {
        id: "capability-shortener-manage",
        order: 10,
        text: "Create and manage shortened URLs.",
      },
      {
        id: "capability-shortener-redirect",
        order: 20,
        text: "Redirect go.rahuly.in/{id} to its target URL.",
      },
      {
        id: "capability-shortener-validate",
        order: 30,
        text: "Validate destination URLs.",
      },
      {
        id: "capability-shortener-limits",
        order: 40,
        text: "Apply per-user and per-client rate limits.",
      },
      {
        id: "capability-shortener-cache",
        order: 50,
        text: "Cache frequently requested redirects.",
      },
      {
        id: "capability-shortener-auth",
        order: 60,
        text: "Provide a shared authentication foundation intended for Rahul’s applications.",
      },
      {
        id: "capability-shortener-learning",
        order: 70,
        text: "Use the project to revisit and strengthen selected technologies already represented in the portfolio.",
      },
    ],
    plannedStack: [
      "Python",
      "FastAPI",
      "React",
      "PostgreSQL",
      "Redis",
      "JWT",
      "Docker",
    ],
    homeStack: ["FastAPI", "React", "PostgreSQL", "Redis"],
    stackRationale:
      "FastAPI will handle link management and redirect APIs, PostgreSQL will store links and ownership data, Redis will support redirect caching and rate limiting, and React will provide the authenticated management interface.",
    laterPossibilities: [],
    featuredOnHome: true,
    projectMark: PROJECT_SLUG.urlShortener,
    seo: {
      title: "URL Shortener — Work in progress | Rahul Yadav",
      description:
        "A practical planned service for creating, managing, and safely redirecting short links while revisiting technologies in Rahul Yadav’s stack.",
      canonicalPath: "/projects/url-shortener",
    },
  },
  {
    id: "project-portfolio-tracker",
    slug: PROJECT_SLUG.portfolioTracker,
    name: "Portfolio Tracker",
    publicationStatus: "published",
    status: "wip",
    order: 30,
    plannedDestination: "invest.rahuly.in",
    summary:
      "A long-term investment journal and portfolio tracker for recording investment decisions, strategies, exit plans, alerts, prices, and performance.",
    plannedCapabilities: [
      {
        id: "capability-portfolio-reasoning",
        order: 10,
        text: "Record the reasoning behind an investment decision.",
      },
      {
        id: "capability-portfolio-strategy",
        order: 20,
        text: "Store the strategy and any decided exit conditions for each stock.",
      },
      {
        id: "capability-portfolio-alerts",
        order: 30,
        text: "Configure price or decision alerts.",
      },
      {
        id: "capability-portfolio-prices",
        order: 40,
        text: "Retrieve current stock prices from an appropriate provider.",
      },
      {
        id: "capability-portfolio-stock-performance",
        order: 50,
        text: "Show invested value, current value, return percentage, and XIRR at stock level.",
      },
      {
        id: "capability-portfolio-overall-performance",
        order: 60,
        text: "Show the same meaningful indicators at overall portfolio level.",
      },
      {
        id: "capability-portfolio-history",
        order: 70,
        text: "Preserve a history of decisions instead of showing only the latest value.",
      },
    ],
    plannedStack: [
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
    homeStack: ["Django REST Framework", "React", "PostgreSQL", "RabbitMQ"],
    stackRationale:
      "Django and Django REST Framework suit the project’s structured financial domain and administrative workflows, PostgreSQL will store portfolio history, and Celery with RabbitMQ and Redis will support planned price refreshes, imports, and alerts.",
    laterPossibilities: [
      {
        id: "possibility-portfolio-spreadsheet-import",
        order: 10,
        text: "Import spreadsheets exported by investment applications.",
      },
      {
        id: "possibility-portfolio-column-mapping",
        order: 20,
        text: "Validate and map imported spreadsheet columns.",
      },
      {
        id: "possibility-portfolio-provider-import",
        order: 30,
        text: "Consider authorized portfolio-import APIs where suitable providers make this technically and legally possible.",
      },
    ],
    disclaimer:
      "Planned as a personal decision-tracking tool, not investment advice.",
    featuredOnHome: true,
    projectMark: PROJECT_SLUG.portfolioTracker,
    seo: {
      title: "Portfolio Tracker — Work in progress | Rahul Yadav",
      description:
        "A planned long-term investment journal and portfolio tracker for recording decisions, strategies, exit plans, alerts, prices, and performance.",
      canonicalPath: "/projects/portfolio-tracker",
    },
  },
  {
    id: "project-universal-job-tracker",
    slug: PROJECT_SLUG.universalJobTracker,
    name: "Universal Job Tracker",
    publicationStatus: "published",
    status: "wip",
    order: 40,
    plannedDestination: "jobs.rahuly.in",
    summary:
      "A compact job-application tracker with customizable columns and typed fields that can adapt to different job-search workflows.",
    plannedCapabilities: [
      {
        id: "capability-job-applications",
        order: 10,
        text: "Track job applications and their relevant details.",
      },
      {
        id: "capability-job-add-columns",
        order: 20,
        text: "Add custom columns.",
      },
      {
        id: "capability-job-delete-columns",
        order: 30,
        text: "Delete default columns.",
      },
      {
        id: "capability-job-column-types",
        order: 40,
        text: "Configure column types including email, text, number, checkbox, and radio.",
      },
      {
        id: "capability-job-validation",
        order: 50,
        text: "Validate values according to their configured column type.",
      },
      {
        id: "capability-job-workflow",
        order: 60,
        text: "Keep the primary workflow within one or two main screens.",
      },
    ],
    plannedStack: [
      "Python",
      "FastAPI",
      "Vue.js",
      "PostgreSQL",
      "SQLAlchemy",
      "Pydantic",
      "Docker",
    ],
    homeStack: ["FastAPI", "Vue.js", "PostgreSQL", "Pydantic"],
    stackRationale:
      "FastAPI, SQLAlchemy, and Pydantic will support typed configurable fields and validation, PostgreSQL will store flexible job records, and Vue.js will provide a compact editable tracking interface.",
    laterPossibilities: [],
    featuredOnHome: true,
    projectMark: PROJECT_SLUG.universalJobTracker,
    seo: {
      title: "Universal Job Tracker — Work in progress | Rahul Yadav",
      description:
        "A planned compact job-application tracker with customizable columns and typed fields for different job-search workflows.",
      canonicalPath: "/projects/universal-job-tracker",
    },
  },
] satisfies readonly ProjectRecord[];
