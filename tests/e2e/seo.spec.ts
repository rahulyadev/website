import { expect, test } from "@playwright/test";

const publicRoutes = [
  {
    path: "/",
    title: "Rahul Yadav | Senior Software Engineer",
    description:
      "Senior Software Engineer Rahul Yadav has six years of experience modernizing Python backends and delivering backend-heavy React and Vue products.",
    canonical: "https://rahuly.in/",
    indexable: true,
    openGraphType: "website",
    structuredTypes: ["ProfilePage", "WebSite"],
  },
  {
    path: "/projects",
    title: "Projects | Rahul Yadav",
    description:
      "A working roadmap of useful products Rahul Yadav plans to build, with four projects currently marked work in progress.",
    canonical: "https://rahuly.in/projects",
    indexable: true,
    openGraphType: "website",
    structuredTypes: [],
  },
  {
    path: "/projects/tourney",
    title: "Tourney — Work in progress | Rahul Yadav",
    description:
      "A flexible tournament manager for creating competitions, recording scores, calculating results, and announcing winners across different games and variants.",
    canonical: "https://rahuly.in/projects/tourney",
    indexable: false,
    openGraphType: "website",
    structuredTypes: [],
  },
  {
    path: "/projects/url-shortener",
    title: "URL Shortener — Work in progress | Rahul Yadav",
    description:
      "A practical planned service for creating, managing, and safely redirecting short links while revisiting technologies in Rahul Yadav’s stack.",
    canonical: "https://rahuly.in/projects/url-shortener",
    indexable: false,
    openGraphType: "website",
    structuredTypes: [],
  },
  {
    path: "/projects/portfolio-tracker",
    title: "Portfolio Tracker — Work in progress | Rahul Yadav",
    description:
      "A planned long-term investment journal and portfolio tracker for recording decisions, strategies, exit plans, alerts, prices, and performance.",
    canonical: "https://rahuly.in/projects/portfolio-tracker",
    indexable: false,
    openGraphType: "website",
    structuredTypes: [],
  },
  {
    path: "/projects/universal-job-tracker",
    title: "Universal Job Tracker — Work in progress | Rahul Yadav",
    description:
      "A planned compact job-application tracker with customizable columns and typed fields for different job-search workflows.",
    canonical: "https://rahuly.in/projects/universal-job-tracker",
    indexable: false,
    openGraphType: "website",
    structuredTypes: [],
  },
  {
    path: "/writings",
    title: "Writings | Rahul Yadav",
    description:
      "Engineering notes on backend systems, application modernization, testing, and the decisions behind maintainable software.",
    canonical: "https://rahuly.in/writings",
    indexable: true,
    openGraphType: "website",
    structuredTypes: ["CollectionPage"],
  },
  {
    path: "/writings/async-document-processing-retries-dlq",
    title:
      "Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues | Rahul Yadav",
    description:
      "A generalized design for reliable document-processing workers that separates durable intake, idempotent stages, bounded retries, and operator-owned dead-letter recovery.",
    canonical:
      "https://rahuly.in/writings/async-document-processing-retries-dlq",
    indexable: true,
    openGraphType: "article",
    structuredTypes: ["Article", "BreadcrumbList"],
  },
  {
    path: "/writings/database-backed-pytest-fixtures",
    title:
      "Replacing Mock-Heavy Tests with Database-Backed pytest Fixtures | Rahul Yadav",
    description:
      "A guide to moving persistence and authorization tests toward small database-backed fixtures while retaining fast unit tests at genuinely isolated boundaries.",
    canonical: "https://rahuly.in/writings/database-backed-pytest-fixtures",
    indexable: true,
    openGraphType: "article",
    structuredTypes: ["Article", "BreadcrumbList"],
  },
  {
    path: "/writings/jwt-revocation-rate-limiting-redis",
    title:
      "Designing JWT Revocation and API Rate Limiting with Redis | Rahul Yadav",
    description:
      "A boundary-focused design for using Redis to revoke otherwise valid JWTs and enforce atomic API rate limits without confusing the two policies.",
    canonical: "https://rahuly.in/writings/jwt-revocation-rate-limiting-redis",
    indexable: true,
    openGraphType: "article",
    structuredTypes: ["Article", "BreadcrumbList"],
  },
  {
    path: "/writings/phased-application-modernization",
    title:
      "Phased Application Modernization Without a Big-Bang Cutover | Rahul Yadav",
    description:
      "A practical framework for moving a legacy application toward a modern stack through explicit seams, reversible routing, and incremental ownership.",
    canonical: "https://rahuly.in/writings/phased-application-modernization",
    indexable: true,
    openGraphType: "article",
    structuredTypes: ["Article", "BreadcrumbList"],
  },
  {
    path: "/writings/reducing-api-payloads",
    title:
      "Reducing API Payloads with Response Shaping and Compression | Rahul Yadav",
    description:
      "A measurement-led approach to making data-heavy APIs smaller by returning intentional fields, paginating work, and applying compression at the right boundary.",
    canonical: "https://rahuly.in/writings/reducing-api-payloads",
    indexable: true,
    openGraphType: "article",
    structuredTypes: ["Article", "BreadcrumbList"],
  },
] as const;

test("all 12 HTML routes emit the exact unique metadata policy", async ({
  page,
}) => {
  for (const route of publicRoutes) {
    await page.goto(route.path);

    await expect(page.locator("html")).toHaveAttribute("lang", "en-IN");
    await expect(page.locator("title")).toHaveCount(1);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      route.description,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      route.canonical,
    );

    for (const [property, content] of [
      ["og:type", route.openGraphType],
      ["og:title", route.title],
      ["og:description", route.description],
      ["og:url", route.canonical],
      ["og:site_name", "Rahul Yadav"],
      ["og:locale", "en_IN"],
    ] as const) {
      const metadata = page.locator(`meta[property="${property}"]`);
      await expect(metadata).toHaveCount(1);
      await expect(metadata).toHaveAttribute("content", content);
    }
    for (const [name, content] of [
      ["twitter:card", "summary"],
      ["twitter:title", route.title],
      ["twitter:description", route.description],
      ["twitter:url", route.canonical],
    ] as const) {
      const metadata = page.locator(`meta[name="${name}"]`);
      await expect(metadata).toHaveCount(1);
      await expect(metadata).toHaveAttribute("content", content);
    }
    await expect(
      page.locator(
        'meta[property="og:image"], meta[name="twitter:image"], meta[name="twitter:site"], meta[name="twitter:creator"]',
      ),
    ).toHaveCount(0);

    const robots = page.locator('meta[name="robots"]');
    const feed = page.locator(
      'link[rel="alternate"][type="application/rss+xml"]',
    );
    if (route.indexable) {
      await expect(robots).toHaveCount(0);
      await expect(feed).toHaveCount(1);
      await expect(feed).toHaveAttribute("href", "https://rahuly.in/rss.xml");
    } else {
      await expect(robots).toHaveCount(1);
      await expect(robots).toHaveAttribute("content", "noindex,follow");
      await expect(feed).toHaveCount(0);
    }

    const structuredTypes = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => {
        return scripts
          .map((script): unknown => JSON.parse(script.textContent))
          .map((value) => {
            if (
              typeof value !== "object" ||
              value === null ||
              !("@type" in value) ||
              typeof value["@type"] !== "string"
            ) {
              throw new Error("Invalid structured-data type.");
            }
            return value["@type"];
          })
          .sort();
      });
    expect(structuredTypes).toEqual([...route.structuredTypes].sort());
  }
});

test("canonical URLs ignore query strings and fragments", async ({ page }) => {
  await page.goto("/projects/?source=seo-test#projects-heading");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rahuly.in/projects",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://rahuly.in/projects",
  );
  await expect(page.locator('meta[name="twitter:url"]')).toHaveAttribute(
    "content",
    "https://rahuly.in/projects",
  );
});

test("unknown routes use only the generic exclusion metadata", async ({
  page,
}) => {
  await page.goto("/not-an-approved-route?source=seo-test#missing");

  await expect(page).toHaveTitle("Page not found | Rahul Yadav");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  await expect(
    page.locator(
      'meta[name="description"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], link[rel="alternate"][type="application/rss+xml"], script[type="application/ld+json"]',
    ),
  ).toHaveCount(0);
});

test("robots.txt is exact and representative pages request no remote resources", async ({
  page,
  request,
}) => {
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toBe(
    "User-agent: *\nAllow: /\n\nSitemap: https://rahuly.in/sitemap.xml\n",
  );

  const remoteResources: string[] = [];
  page.on("request", (browserRequest) => {
    if (
      ["document", "font", "image", "script", "stylesheet"].includes(
        browserRequest.resourceType(),
      ) &&
      new URL(browserRequest.url()).origin !== "http://127.0.0.1:4173"
    ) {
      remoteResources.push(browserRequest.url());
    }
  });
  for (const path of [
    "/",
    "/projects/tourney",
    "/writings/phased-application-modernization",
    "/not-an-approved-route",
  ]) {
    await page.goto(path);
  }
  expect(remoteResources).toEqual([]);
});
