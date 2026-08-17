import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const projects = [
  {
    slug: "tourney",
    name: "Tourney",
    destination: "tourney.rahuly.in",
    stackCount: 7,
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    destination: "go.rahuly.in",
    stackCount: 7,
  },
  {
    slug: "portfolio-tracker",
    name: "Portfolio Tracker",
    destination: "invest.rahuly.in",
    stackCount: 9,
  },
  {
    slug: "universal-job-tracker",
    name: "Universal Job Tracker",
    destination: "jobs.rahuly.in",
    stackCount: 7,
  },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return {
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -0.5 || rect.right > width + 0.5;
        })
        .slice(0, 8)
        .map((element) => ({
          className: element.className,
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
          text: element.textContent.trim().slice(0, 60),
        })),
      scrollWidth: document.documentElement.scrollWidth,
      width,
    };
  });

  expect(
    result.scrollWidth,
    JSON.stringify(result, undefined, 2),
  ).toBeLessThanOrEqual(result.width);
  expect(result.offenders, JSON.stringify(result, undefined, 2)).toEqual([]);
}

test("home and project index render the approved roadmap in order", async ({
  page,
}) => {
  await page.goto("/");
  const homeProjects = page.locator("#projects");
  await expect(
    homeProjects.getByRole("heading", {
      level: 2,
      name: "What I’m building next",
    }),
  ).toBeVisible();
  await expect(homeProjects.locator(".project-card")).toHaveCount(4);
  await expect(homeProjects.getByText("WIP", { exact: true })).toHaveCount(4);
  await expect(
    homeProjects.getByRole("link", { name: "Explore all project plans" }),
  ).toHaveAttribute("href", "/projects");
  expect(
    await homeProjects
      .locator(".project-card")
      .evaluateAll((cards) =>
        cards.map((card) => card.getAttribute("data-project")),
      ),
  ).toEqual(projects.map(({ slug }) => slug));

  for (const project of projects) {
    const card = homeProjects.locator(`[data-project="${project.slug}"]`);
    await expect(card.locator(".planned-stack-list > li")).toHaveCount(4);
    await expect(
      card.getByText(project.destination, { exact: true }),
    ).not.toHaveAttribute("href");
  }

  await page.goto("/projects");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(4);

  for (const project of projects) {
    const card = page.locator(`[data-project="${project.slug}"]`);
    await expect(
      card.getByRole("link", {
        name: `View project plan for ${project.name}`,
      }),
    ).toHaveAttribute("href", `/projects/${project.slug}`);
    await expect(card.locator(".planned-stack-list > li")).toHaveCount(
      project.stackCount,
    );
    await expect(
      card.getByText(project.destination, { exact: true }),
    ).not.toHaveAttribute("href");
  }
});

for (const [index, project] of projects.entries()) {
  test(`${project.name} detail is prerendered and truthful`, async ({
    page,
  }) => {
    await page.goto(`/projects/${project.slug}`);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 1, name: project.name }),
    ).toBeVisible();
    await expect(page.getByText("WIP", { exact: true })).toHaveCount(1);
    await expect(
      page.getByText(
        "Work in progress — development has not started yet. This page describes the intended direction, not shipped functionality.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "What I plan to build",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Planned stack" }),
    ).toBeVisible();
    await expect(page.locator(".planned-stack-list > li")).toHaveCount(
      project.stackCount,
    );
    await expect(
      page.getByText(project.destination, { exact: true }),
    ).not.toHaveAttribute("href");
    await expect(page.locator(`a[href*="${project.destination}"]`)).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("link", {
        name: /^(?:Live|Demo|Source|Visit|Open app)$/i,
      }),
    ).toHaveCount(0);

    const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(
      breadcrumbs.getByRole("link", { name: "Home" }),
    ).toHaveAttribute("href", "/");
    await expect(
      breadcrumbs.getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("href", "/projects");
    await expect(page.locator(".project-mark svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,follow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://rahuly.in/projects/${project.slug}`,
    );
    await expect(page).toHaveTitle(
      `${project.name} — Work in progress | Rahul Yadav`,
    );

    const projectNavigation = page.getByRole("navigation", {
      name: "Project plans",
    });
    if (index > 0) {
      await expect(
        projectNavigation.getByRole("link", {
          name: new RegExp(projects[index - 1]?.name ?? ""),
        }),
      ).toBeVisible();
    }
    if (index < projects.length - 1) {
      await expect(
        projectNavigation.getByRole("link", {
          name: new RegExp(projects[index + 1]?.name ?? ""),
        }),
      ).toBeVisible();
    }
  });
}

test("project metadata, heart semantics, and representative accessibility are correct", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page).toHaveTitle("Projects | Rahul Yadav");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rahuly.in/projects",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.goto("/projects/url-shortener");
  await expect(
    page.getByRole("main").getByRole("img", { name: "love" }),
  ).toHaveText("❤️");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});

test("an unknown project slug uses the accessible noindex 404", async ({
  page,
}) => {
  await page.goto("/projects/not-a-project");
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});

test("project layouts remain collision-free across wide, intermediate, mobile, and 200% text states", async ({
  page,
}) => {
  for (const state of [
    { width: 1440, height: 900, textScale: 1 },
    { width: 900, height: 900, textScale: 1 },
    { width: 390, height: 844, textScale: 1 },
    { width: 320, height: 640, textScale: 1 },
    { width: 640, height: 900, textScale: 2 },
  ]) {
    await page.setViewportSize(state);
    for (const path of ["/projects", "/projects/tourney"]) {
      await page.goto(path);
      if (state.textScale === 2) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
      }
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("project marks retain dark, system, reduced-motion, and forced-color behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/projects");
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".project-mark")).toHaveCount(4);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const transitionDurations = await page
    .locator(".project-mark")
    .first()
    .evaluate((mark) => getComputedStyle(mark).transitionDuration);
  expect(
    Math.max(
      ...transitionDurations
        .split(", ")
        .map((value) =>
          value.endsWith("ms")
            ? Number.parseFloat(value)
            : Number.parseFloat(value) * 1_000,
        ),
    ),
  ).toBeLessThanOrEqual(0.01);

  await page.emulateMedia({ colorScheme: "dark", forcedColors: "active" });
  await expect(page.locator(".project-mark").first()).toHaveCSS(
    "background-image",
    "none",
  );
  await expectNoHorizontalOverflow(page);
});

test("project routes emit no browser-console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  for (const path of [
    "/",
    "/projects",
    ...projects.map(({ slug }) => `/projects/${slug}`),
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test("project roadmap content remains available without JavaScript", async ({
  baseURL,
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? "http://127.0.0.1:4173",
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  try {
    await page.goto("/projects");
    await expect(page.locator(".project-card")).toHaveCount(4);
    await expect(page.getByText("WIP", { exact: true })).toHaveCount(4);
    await page.goto("/projects/tourney");
    await expect(
      page.getByRole("heading", { level: 1, name: "Tourney" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Work in progress — development has not started yet. This page describes the intended direction, not shipped functionality.",
      ),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  } finally {
    await context.close();
  }
});
