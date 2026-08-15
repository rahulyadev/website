import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const knownRoutes = [
  { path: "/", heading: "Rahul Yadav" },
  { path: "/projects", heading: "Projects" },
  { path: "/writings", heading: "Writings" },
] as const;

const missingRoutes = [
  { path: "/missing-page", name: "unknown route" },
  {
    path: "/projects/**missing-project-test**",
    name: "missing project route",
  },
  {
    path: "/writings/**missing-writing-test**",
    name: "missing writing route",
  },
] as const;

async function expectNotFoundState(page: Page) {
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByText("The requested page is not available."),
  ).toBeVisible();

  const returnHomeLink = page.getByRole("link", { name: "Return home" });
  await expect(returnHomeLink).toBeVisible();
  await expect(returnHomeLink).toHaveAttribute("href", "/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /(?:^|[\s,])noindex(?:$|[\s,])/i,
  );

  return returnHomeLink;
}

for (const route of knownRoutes) {
  test(`${route.path} supports direct navigation`, async ({ page }) => {
    await page.goto(route.path);

    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });
}

test("primary navigation changes routes", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Writings" }).click();
  await expect(page).toHaveURL(/\/writings$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Writings" }),
  ).toBeVisible();
});

test("skip link moves keyboard focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

for (const route of missingRoutes) {
  test(`${route.name} renders an accessible not-found state`, async ({
    page,
  }) => {
    await page.goto(route.path);

    const returnHomeLink = await expectNotFoundState(page);
    await returnHomeLink.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Rahul Yadav" }),
    ).toBeVisible();

    await page.goto(route.path);
    await page.reload();
    await expectNotFoundState(page);
  });
}

test("representative states have no automated accessibility violations", async ({
  page,
}) => {
  const accessibilityRoutes = [
    ...knownRoutes.map((route) => route.path),
    ...missingRoutes.map((route) => route.path),
  ];

  for (const path of accessibilityRoutes) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations, `axe violations for ${path}`).toEqual([]);
  }
});

test("the content routes do not overflow horizontally", async ({ page }) => {
  await page.goto("/");

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );

  expect(hasOverflow).toBe(false);
});
