import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const writings = [
  {
    slug: "async-document-processing-retries-dlq",
    title:
      "Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues",
    publishedOn: "2026-08-17",
    indexDate: "17 Aug 2026",
  },
  {
    slug: "database-backed-pytest-fixtures",
    title: "Replacing Mock-Heavy Tests with Database-Backed pytest Fixtures",
    publishedOn: "2026-08-10",
    indexDate: "10 Aug 2026",
  },
  {
    slug: "jwt-revocation-rate-limiting-redis",
    title: "Designing JWT Revocation and API Rate Limiting with Redis",
    publishedOn: "2026-08-03",
    indexDate: "3 Aug 2026",
  },
  {
    slug: "phased-application-modernization",
    title: "Phased Application Modernization Without a Big-Bang Cutover",
    publishedOn: "2026-07-27",
    indexDate: "27 Jul 2026",
  },
  {
    slug: "reducing-api-payloads",
    title: "Reducing API Payloads with Response Shaping and Compression",
    publishedOn: "2026-07-20",
    indexDate: "20 Jul 2026",
  },
] as const;

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function hasHorizontalPageOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
}

test("writings index renders the approved editorial inventory and discovery metadata", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/writings");

  await expect(
    page.getByRole("heading", { level: 1, name: "Writings" }),
  ).toBeVisible();
  await expect(
    page.getByText("ENGINEERING NOTES", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Notes on backend systems, application modernization, testing, and the engineering decisions behind maintainable software.",
    ),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".writing-row")).toHaveCount(5);
  expect(
    await page
      .locator(".writing-row h2 a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(writings.map(({ slug }) => `/writings/${slug}`));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rahuly.in/writings",
  );
  await expect(
    page.locator('link[rel="alternate"][type="application/rss+xml"]'),
  ).toHaveAttribute("href", "https://rahuly.in/rss.xml");
  await expect(page.locator(".writing-row time")).toHaveCount(5);
  expect(
    await page.locator(".writing-row").evaluateAll((rows) =>
      rows.map((row) => {
        const body = row.querySelector(":scope > .writing-row__body");
        const date = body?.querySelector(":scope > time:first-child");
        return {
          dateTime: date?.getAttribute("datetime"),
          dateText: date?.textContent,
          dateBeforeTitle: date?.nextElementSibling?.tagName === "H2",
          sameColumn: date?.parentElement === body,
        };
      }),
    ),
  ).toEqual(
    writings.map((writing) => ({
      dateTime: writing.publishedOn,
      dateText: writing.indexDate,
      dateBeforeTitle: true,
      sameColumn: true,
    })),
  );
  expect(errors).toEqual([]);
});

for (const [writingIndex, writing] of writings.entries()) {
  test(`${writing.slug} supports direct navigation, refresh, metadata, and article semantics`, async ({
    page,
  }) => {
    const errors = collectRuntimeErrors(page);
    await page.goto(`/writings/${writing.slug}`);
    await page.reload();

    await expect(
      page.getByRole("heading", { level: 1, name: writing.title }),
    ).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(`${writing.title} | Rahul Yadav`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://rahuly.in/writings/${writing.slug}`,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "article",
    );
    await expect(
      page.locator('meta[property="article:published_time"]'),
    ).toHaveAttribute("content", writing.publishedOn);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeVisible();
    const toc = page.locator("details.article-toc");
    await expect(toc).not.toHaveAttribute("open", "");
    await expect(toc.locator("summary")).toHaveText("On this page");
    await expect(toc.locator("summary")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(page.locator(".article-prose h2[id]").first()).toBeVisible();
    await expect(page.locator(".article-code pre code").first()).toBeVisible();
    await expect(
      page.getByText("By Rahul Yadav", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".writing-detail__metadata time").first(),
    ).toHaveAttribute("datetime", writing.publishedOn);
    await expect(
      page.getByRole("link", { name: "Back to writings" }),
    ).toHaveAttribute("href", "/writings");
    const writingNavigation = page.getByRole("navigation", {
      name: "More writings",
    });
    const newer = writings[writingIndex - 1];
    const older = writings[writingIndex + 1];
    if (newer === undefined) {
      await expect(writingNavigation.getByText("← Newer writing")).toHaveCount(
        0,
      );
    } else {
      await expect(
        writingNavigation.getByText("← Newer writing").locator(".."),
      ).toHaveAttribute("href", `/writings/${newer.slug}`);
    }
    if (older === undefined) {
      await expect(writingNavigation.getByText("Older writing →")).toHaveCount(
        0,
      );
    } else {
      await expect(
        writingNavigation.getByText("Older writing →").locator(".."),
      ).toHaveAttribute("href", `/writings/${older.slug}`);
    }

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .evaluate((script): unknown => JSON.parse(script.textContent));
    expect(structuredData).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: writing.title,
      datePublished: writing.publishedOn,
      mainEntityOfPage: `https://rahuly.in/writings/${writing.slug}`,
      author: { "@type": "Person", name: "Rahul Yadav" },
      inLanguage: "en-IN",
    });
    expect(structuredData).not.toHaveProperty("publisher");
    expect(structuredData).not.toHaveProperty("image");
    expect(errors).toEqual([]);
  });
}

test("unknown writing slugs render the accessible noindex fallback without article metadata", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/writings/not-an-approved-writing");

  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(errors).toEqual([
    "Failed to load resource: the server responded with a status of 404 (Not Found)",
  ]);
});

test("copy code and responsive table enhancements are keyboard-safe and stable", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-write"]);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/writings/phased-application-modernization");

  const copyButton = page.getByRole("button", { name: "Copy code" });
  const before = await copyButton.boundingBox();
  const idleBackground = await copyButton.evaluate(
    (button) => getComputedStyle(button).backgroundColor,
  );
  await copyButton.focus();
  await expect(copyButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Code copied" })).toBeVisible();
  const after = await page
    .getByRole("button", { name: "Code copied" })
    .boundingBox();
  const successBackground = await page
    .getByRole("button", { name: "Code copied" })
    .evaluate((button) => getComputedStyle(button).backgroundColor);
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  expect(successBackground).not.toBe(idleBackground);

  const tableRegion = page.getByRole("region", { name: /Table: Concern/ });
  await expect(tableRegion).toHaveAttribute("tabindex", "0");
  await tableRegion.focus();
  await expect(tableRegion).toBeFocused();
  await expect(page.locator("table th").first()).toHaveAttribute(
    "scope",
    "col",
  );
  expect(await hasHorizontalPageOverflow(page)).toBe(false);
});

test("the sticky contents disclosure supports pointer, keyboard, dismissal, and focused anchor navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto("/writings/phased-application-modernization");

  const toc = page.locator("details.article-toc");
  const summary = toc.locator("summary");
  const navigation = toc.getByRole("navigation", { name: "On this page" });
  const firstLink = navigation.getByRole("link", {
    name: "Start with a migration boundary, not a framework",
  });

  await expect(toc).not.toHaveAttribute("open", "");
  await summary.click();
  await expect(toc).toHaveAttribute("open", "");
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  await navigation.dispatchEvent("pointerdown");
  await expect(toc).toHaveAttribute("open", "");

  await page.locator(".writing-detail__header h1").dispatchEvent("pointerdown");
  await expect(toc).not.toHaveAttribute("open", "");

  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(toc).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(toc).not.toHaveAttribute("open", "");
  await page.keyboard.press("Space");
  await expect(toc).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(toc).not.toHaveAttribute("open", "");
  await expect(summary).toBeFocused();

  await toc.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    window.scrollBy({ top: 480 });
  });
  const stickyGeometry = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const disclosure = document.querySelector(".article-toc");
    if (
      !(header instanceof HTMLElement) ||
      !(disclosure instanceof HTMLElement)
    ) {
      return null;
    }
    const headerRect = header.getBoundingClientRect();
    const disclosureRect = disclosure.getBoundingClientRect();
    return {
      disclosureTop: disclosureRect.top,
      headerBottom: headerRect.bottom,
      position: getComputedStyle(disclosure).position,
    };
  });
  expect(stickyGeometry).not.toBeNull();
  expect(stickyGeometry?.position).toBe("sticky");
  expect(stickyGeometry?.disclosureTop).toBeGreaterThanOrEqual(
    (stickyGeometry?.headerBottom ?? 0) - 1,
  );

  await summary.click();
  await firstLink.click();
  await expect(page).toHaveURL(
    /#start-with-a-migration-boundary-not-a-framework$/,
  );
  await expect(toc).not.toHaveAttribute("open", "");
  const target = page.locator(
    "#start-with-a-migration-boundary-not-a-framework",
  );
  await expect(target).toBeFocused();
  const anchorGeometry = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const disclosure = document.querySelector(".article-toc > summary");
    const target = document.querySelector(
      "#start-with-a-migration-boundary-not-a-framework",
    );
    if (
      !(header instanceof HTMLElement) ||
      !(disclosure instanceof HTMLElement) ||
      !(target instanceof HTMLElement)
    ) {
      return null;
    }
    return {
      stickyBottom:
        header.getBoundingClientRect().bottom +
        disclosure.getBoundingClientRect().height,
      targetTop: target.getBoundingClientRect().top,
    };
  });
  expect(anchorGeometry).not.toBeNull();
  expect(anchorGeometry?.targetTop).toBeGreaterThanOrEqual(
    (anchorGeometry?.stickyBottom ?? 0) - 1,
  );
});

test("index and representative article have no detectable axe violations", async ({
  page,
}) => {
  for (const path of [
    "/writings",
    "/writings/phased-application-modernization",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `axe violations for ${path}`).toEqual([]);
    if (path !== "/writings") {
      await page.locator(".article-toc summary").click();
      const expandedResults = await new AxeBuilder({ page }).analyze();
      expect(
        expandedResults.violations,
        `expanded TOC axe violations for ${path}`,
      ).toEqual([]);
    }
  }
});

test("article content remains complete and readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/writings/phased-application-modernization");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Phased Application Modernization Without a Big-Bang Cutover",
    }),
  ).toBeVisible();
  await expect(page.locator(".article-prose")).toContainText(
    "Modernizing an application",
  );
  await expect(page.locator(".article-code pre code")).toContainText(
    "send request to new-api",
  );
  await expect(page.locator(".article-code__copy")).toHaveCount(0);
  await expect(page.getByRole("table")).toBeVisible();
  const toc = page.locator("details.article-toc");
  await expect(toc).not.toHaveAttribute("open", "");
  await toc.locator("summary").click();
  await expect(toc).toHaveAttribute("open", "");
  await toc
    .getByRole("link", {
      name: "Start with a migration boundary, not a framework",
    })
    .click();
  await expect(page).toHaveURL(
    /#start-with-a-migration-boundary-not-a-framework$/,
  );
  await expect(
    page.locator("#start-with-a-migration-boundary-not-a-framework"),
  ).toBeVisible();
  await context.close();
});

test("writing layouts avoid clipping across wide, intermediate, mobile, 320px, and 200% text", async ({
  page,
}) => {
  const states = [
    { width: 1440, height: 900, textScale: 1 },
    { width: 820, height: 900, textScale: 1 },
    { width: 390, height: 844, textScale: 1 },
    { width: 320, height: 720, textScale: 1 },
    { width: 820, height: 1000, textScale: 2 },
    { width: 390, height: 844, textScale: 2 },
  ];

  for (const state of states) {
    await page.setViewportSize({ width: state.width, height: state.height });
    for (const path of [
      "/writings",
      "/writings/phased-application-modernization",
    ]) {
      await page.goto(path);
      if (state.textScale === 2) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
      }
      expect(
        await hasHorizontalPageOverflow(page),
        `page overflow for ${path} at ${String(state.width)}px and ${String(state.textScale)}x text`,
      ).toBe(false);
      await expect(page.locator("h1")).toBeVisible();

      const headerGeometry = await page
        .locator(".site-header__inner")
        .evaluate((header) => {
          const identity = header.querySelector(".compact-identity");
          const navigation = header.querySelector(".site-navigation-region");
          if (
            !(identity instanceof HTMLElement) ||
            !(navigation instanceof HTMLElement)
          ) {
            return null;
          }
          const identityRect = identity.getBoundingClientRect();
          const navigationRect = navigation.getBoundingClientRect();
          return {
            identityRight: identityRect.right,
            navigationLeft: navigationRect.left,
          };
        });
      expect(headerGeometry).not.toBeNull();
      expect(headerGeometry?.identityRight).toBeLessThanOrEqual(
        (headerGeometry?.navigationLeft ?? 0) + 1,
      );

      if (path === "/writings") {
        const geometry = await page.evaluate(() => {
          const header = document.querySelector(".writings-page__header");
          const introduction = document.querySelector(
            ".writings-page__introduction",
          );
          const row = document.querySelector(".writing-row");
          const body = row?.querySelector(":scope > .writing-row__body");
          const date = body?.querySelector(":scope > time:first-child");
          const title = body?.querySelector(":scope > h2");
          const summary = body?.querySelector(".writing-row__summary");
          if (
            !(header instanceof HTMLElement) ||
            !(introduction instanceof HTMLElement) ||
            !(row instanceof HTMLElement) ||
            !(body instanceof HTMLElement) ||
            !(date instanceof HTMLElement) ||
            !(title instanceof HTMLElement) ||
            !(summary instanceof HTMLElement)
          ) {
            return null;
          }
          return {
            bodyWidth: body.getBoundingClientRect().width,
            dateLeft: date.getBoundingClientRect().left,
            headerWidth: header.getBoundingClientRect().width,
            introductionWidth: introduction.getBoundingClientRect().width,
            rowWidth: row.getBoundingClientRect().width,
            summaryWidth: summary.getBoundingClientRect().width,
            titleLeft: title.getBoundingClientRect().left,
          };
        });
        expect(geometry).not.toBeNull();
        expect(
          Math.abs((geometry?.bodyWidth ?? 0) - (geometry?.rowWidth ?? 0)),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs((geometry?.summaryWidth ?? 0) - (geometry?.bodyWidth ?? 0)),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(
            (geometry?.introductionWidth ?? 0) - (geometry?.headerWidth ?? 0),
          ),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs((geometry?.dateLeft ?? 0) - (geometry?.titleLeft ?? 0)),
        ).toBeLessThanOrEqual(1);
      } else {
        const geometry = await page.evaluate(() => {
          const detail = document.querySelector(".writing-detail");
          const header = document.querySelector(".writing-detail__header");
          const title = header?.querySelector("h1");
          const summary = header?.querySelector(".writing-detail__summary");
          const prose = document.querySelector(".article-prose");
          const paragraph = prose?.querySelector(":scope > p");
          if (
            !(detail instanceof HTMLElement) ||
            !(header instanceof HTMLElement) ||
            !(title instanceof HTMLElement) ||
            !(summary instanceof HTMLElement) ||
            !(prose instanceof HTMLElement) ||
            !(paragraph instanceof HTMLElement)
          ) {
            return null;
          }
          return {
            detailWidth: detail.getBoundingClientRect().width,
            headerWidth: header.getBoundingClientRect().width,
            paragraphWidth: paragraph.getBoundingClientRect().width,
            proseWidth: prose.getBoundingClientRect().width,
            summaryWidth: summary.getBoundingClientRect().width,
            titleWidth: title.getBoundingClientRect().width,
          };
        });
        expect(geometry).not.toBeNull();
        for (const width of [
          geometry?.headerWidth,
          geometry?.paragraphWidth,
          geometry?.proseWidth,
          geometry?.summaryWidth,
          geometry?.titleWidth,
        ]) {
          expect(
            Math.abs((width ?? 0) - (geometry?.detailWidth ?? 0)),
          ).toBeLessThanOrEqual(1);
        }
      }
    }
  }
});

test("all article titles retain natural phrase wrapping at 320px and 200% text", async ({
  page,
}) => {
  const states = [
    { width: 320, height: 720, textScale: 1 },
    { width: 390, height: 844, textScale: 2 },
  ];

  for (const state of states) {
    await page.setViewportSize({ width: state.width, height: state.height });
    for (const writing of writings) {
      await page.goto(`/writings/${writing.slug}`);
      if (state.textScale === 2) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
      }
      const wrapping = await page
        .locator(".writing-detail__header h1")
        .evaluate((heading) => {
          const style = getComputedStyle(heading);
          const lineHeight = Number.parseFloat(style.lineHeight);
          return {
            lines: Math.round(
              heading.getBoundingClientRect().height / lineHeight,
            ),
            words: heading.textContent.trim().split(/\s+/u).length,
            wordBreak: style.wordBreak,
          };
        });
      expect(wrapping.wordBreak).not.toBe("break-all");
      expect(
        wrapping.lines,
        `${writing.slug} line count at ${String(state.width)}px/${String(state.textScale)}x`,
      ).toBeLessThan(wrapping.words);
      expect(await hasHorizontalPageOverflow(page)).toBe(false);
    }
  }
});

test("light-mode code and table surfaces are tinted, related, and distinguishable", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/writings/phased-application-modernization");

  const surfaces = await page.evaluate(() => {
    const background = (selector: string) => {
      const element = document.querySelector(selector);
      return element instanceof HTMLElement
        ? getComputedStyle(element).backgroundColor
        : null;
    };
    return {
      codeBody: background(".article-code pre"),
      codeHeader: background(".article-code__header"),
      tableBody: background(".article-table-region td"),
      tableHeader: background(".article-table-region th"),
    };
  });
  for (const surface of [surfaces.codeBody, surfaces.tableBody]) {
    expect(surface).not.toBeNull();
    expect(surface).not.toBe("rgb(255, 255, 255)");
    expect(surface).not.toBe("rgba(0, 0, 0, 0)");
  }
  expect(surfaces.codeHeader).not.toBe(surfaces.codeBody);
  expect(surfaces.tableHeader).not.toBe(surfaces.tableBody);
});

test("Writings surface tints do not alter approved shared card and theme-control colors", async ({
  page,
}) => {
  const modes = [
    {
      colorScheme: "light",
      label: "Light",
      expected: {
        credibilityBackground: "rgb(236, 232, 225)",
        projectBackground: "rgb(252, 250, 246)",
        sharedBorder: "rgb(216, 211, 202)",
        themeBackground: "rgb(236, 232, 225)",
        selectedBackground: "rgb(255, 255, 255)",
        selectedBorder: "rgb(31, 95, 153)",
      },
    },
    {
      colorScheme: "dark",
      label: "Dark",
      expected: {
        credibilityBackground: "rgb(41, 46, 50)",
        projectBackground: "rgb(27, 31, 34)",
        sharedBorder: "rgb(57, 63, 68)",
        themeBackground: "rgb(41, 46, 50)",
        selectedBackground: "rgb(34, 39, 43)",
        selectedBorder: "rgb(126, 178, 226)",
      },
    },
    {
      colorScheme: "dark",
      label: "System",
      expected: {
        credibilityBackground: "rgb(41, 46, 50)",
        projectBackground: "rgb(27, 31, 34)",
        sharedBorder: "rgb(57, 63, 68)",
        themeBackground: "rgb(41, 46, 50)",
        selectedBackground: "rgb(34, 39, 43)",
        selectedBorder: "rgb(126, 178, 226)",
      },
    },
  ] as const;

  for (const mode of modes) {
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await page.goto("/");
    const openNavigation = page.getByRole("button", {
      name: "Open navigation",
    });
    if (await openNavigation.isVisible()) await openNavigation.click();
    const selectedTheme = page.getByRole("radio", { name: mode.label });
    await selectedTheme.click();
    await expect(selectedTheme).toHaveAttribute("aria-checked", "true");
    await page.waitForTimeout(250);

    const sharedSurfaces = await page.evaluate(() => {
      const colors = (selector: string) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) return null;
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          border: style.borderColor,
        };
      };

      return {
        credibility: colors(".credibility-list__item"),
        project: colors(".project-card"),
        selectedTheme: colors('.ui-theme-toggle__option[aria-checked="true"]'),
        theme: colors(".ui-theme-toggle"),
      };
    });

    expect(sharedSurfaces).toEqual({
      credibility: {
        background: mode.expected.credibilityBackground,
        border: mode.expected.sharedBorder,
      },
      project: {
        background: mode.expected.projectBackground,
        border: mode.expected.sharedBorder,
      },
      selectedTheme: {
        background: mode.expected.selectedBackground,
        border: mode.expected.selectedBorder,
      },
      theme: {
        background: mode.expected.themeBackground,
        border: mode.expected.sharedBorder,
      },
    });
  }
});

test("article remains legible in dark, reduced-motion, forced-colors, and print media", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/writings/phased-application-modernization");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.locator(".article-prose").evaluate((element) => {
      const style = getComputedStyle(element);
      return style.color !== style.backgroundColor;
    }),
  ).toBe(true);
  expect(
    await page
      .locator(".writing-row, .writing-detail")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).not.toContain("0.22s");

  await page.emulateMedia({ forcedColors: "active" });
  await expect(page.locator(".article-code")).toBeVisible();
  await expect(page.locator(".article-table-region")).toBeVisible();
  await expect(page.locator(".article-toc summary")).toBeVisible();

  await page.emulateMedia({ media: "print", forcedColors: "none" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  await expect(page.locator(".article-code__copy")).toBeHidden();
  await expect(page.locator(".article-toc")).toBeHidden();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".writing-detail__byline")).toBeVisible();
  await expect(page.locator(".article-code pre")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    await page
      .locator(".article-table-region td")
      .first()
      .evaluate((cell) => getComputedStyle(cell).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
});

test("RSS and sitemap resource routes are directly navigable and structurally complete", async ({
  page,
  request,
}) => {
  const errors = collectRuntimeErrors(page);
  const rssResponse = await request.get("/rss.xml");
  const sitemapResponse = await request.get("/sitemap.xml");
  expect(rssResponse.ok()).toBe(true);
  expect(sitemapResponse.ok()).toBe(true);
  expect(rssResponse.headers()["content-type"]).toMatch(
    /^(?:application\/rss\+xml|text\/xml)/,
  );
  expect(sitemapResponse.headers()["content-type"]).toMatch(
    /^(?:application|text)\/xml/,
  );

  const rss = await rssResponse.text();
  const sitemap = await sitemapResponse.text();
  expect(rss.match(/<item>/g)).toHaveLength(5);
  expect(rss).not.toContain("content:encoded");
  expect(sitemap.match(/<loc>/g)).toHaveLength(12);
  expect(
    [...rss.matchAll(/<pubDate>([^<]+)<\/pubDate>/gu)].map((match) => match[1]),
  ).toEqual([
    "Mon, 17 Aug 2026 00:00:00 GMT",
    "Mon, 10 Aug 2026 00:00:00 GMT",
    "Mon, 03 Aug 2026 00:00:00 GMT",
    "Mon, 27 Jul 2026 00:00:00 GMT",
    "Mon, 20 Jul 2026 00:00:00 GMT",
  ]);
  expect(
    [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/gu)].map(
      (match) => match[1],
    ),
  ).toEqual(writings.map((writing) => writing.publishedOn));
  for (const { slug } of writings) {
    expect(rss).toContain(`https://rahuly.in/writings/${slug}`);
    expect(sitemap).toContain(`https://rahuly.in/writings/${slug}`);
  }

  for (const path of ["/rss.xml", "/sitemap.xml"]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
  }
  expect(errors).toEqual([]);
});
