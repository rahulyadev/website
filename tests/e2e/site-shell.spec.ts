import AxeBuilder from "@axe-core/playwright";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { expect, test, type Locator, type Page } from "@playwright/test";

const resumeSha256 =
  "5fbee53357526963b6cd78cd472f16bcde7525a1607f85f737d61b2f8411a9b9";

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

async function expectMinimumTarget(target: Locator) {
  const box = await target.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
}

async function scrollToDocumentBottom(page: Page) {
  const maximumScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(maximumScroll).toBeGreaterThan(0);
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(
          document.documentElement.scrollHeight -
            window.innerHeight -
            window.scrollY,
        ),
      ),
    )
    .toBeLessThan(2);
}

async function expectHeroNameOnOneLine(page: Page, minimumFontSize = 40) {
  const metrics = await page
    .getByRole("heading", { level: 1, name: "Rahul Yadav" })
    .evaluate((heading) => {
      const range = document.createRange();
      range.selectNodeContents(heading);
      const lineTops = new Set(
        Array.from(range.getClientRects(), (rect) => Math.round(rect.top)),
      );
      const rect = heading.getBoundingClientRect();
      return {
        fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
        left: rect.left,
        lineCount: lineTops.size,
        right: rect.right,
        viewportWidth: document.documentElement.clientWidth,
        whiteSpace: getComputedStyle(heading).whiteSpace,
      };
    });

  expect(metrics.lineCount).toBe(1);
  expect(metrics.whiteSpace).toBe("nowrap");
  expect(metrics.fontSize).toBeGreaterThanOrEqual(minimumFontSize);
  expect(metrics.left).toBeGreaterThanOrEqual(0);
  expect(metrics.right).toBeLessThanOrEqual(metrics.viewportWidth + 0.5);
  await expectNoHorizontalOverflow(page);
}

test("home shell, active navigation, and compact identity follow route and scroll state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expectHeroNameOnOneLine(page);

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 1, name: "Rahul Yadav" }),
  ).toBeVisible();
  const primary = page.getByRole("navigation", { name: "Primary" });
  await expect(primary.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  const compactIdentity = page.locator(".compact-identity");
  await expect(compactIdentity).toHaveAttribute("data-visible", "false");
  await page
    .getByRole("heading", {
      level: 2,
      name: "Backend depth, full-stack delivery",
    })
    .scrollIntoViewIfNeeded();
  await expect(compactIdentity).toHaveAttribute("data-visible", "true");
  await expect(compactIdentity.locator("img")).toHaveAttribute("alt", "");
  await expect(page.locator("h1")).toHaveCount(1);

  await primary.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
  await expect(compactIdentity).toHaveAttribute("data-visible", "true");
  await expect(primary.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("hero uses portrait-left desktop composition and portrait-first mobile composition", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const portraitFrame = page.locator(".home-hero__portrait-frame");
  const heroCopy = page.locator(".home-hero__copy");
  const desktopPortrait = await portraitFrame.boundingBox();
  const desktopCopy = await heroCopy.boundingBox();
  expect(desktopPortrait?.x).toBeLessThan(desktopCopy?.x ?? 0);
  expect(desktopPortrait?.height).toBeGreaterThan(
    desktopPortrait?.width ?? Number.POSITIVE_INFINITY,
  );

  for (const action of await page.locator(".home-hero__actions a").all()) {
    await expectMinimumTarget(action);
    const box = await action.boundingBox();
    expect(box?.width).toBeLessThan(240);
  }

  await page
    .getByRole("heading", {
      level: 2,
      name: "Backend depth, full-stack delivery",
    })
    .scrollIntoViewIfNeeded();
  const compactImage = page.locator(".compact-identity__image");
  await expect(compactImage).toBeVisible();
  const compactFrame = await page
    .locator(".compact-identity__portrait")
    .boundingBox();
  expect(
    Math.abs((compactFrame?.width ?? 0) - (compactFrame?.height ?? 0)),
  ).toBeLessThan(0.01);
  const portraitComposition = await page.evaluate(() => {
    const heroImage = document.querySelector<HTMLImageElement>(
      ".home-hero__portrait",
    );
    const headerImage = document.querySelector<HTMLImageElement>(
      ".compact-identity__image",
    );
    if (heroImage === null || headerImage === null) return undefined;
    return {
      headerAspect: headerImage.naturalWidth / headerImage.naturalHeight,
      headerPosition: getComputedStyle(headerImage).objectPosition,
      heroAspect: heroImage.naturalWidth / heroImage.naturalHeight,
      heroPosition: getComputedStyle(heroImage).objectPosition,
    };
  });
  expect(portraitComposition?.headerAspect).toBeCloseTo(0.8, 2);
  expect(portraitComposition?.heroAspect).toBeCloseTo(0.8, 2);
  expect(portraitComposition?.headerPosition).toBe("50% 34%");
  expect(portraitComposition?.heroPosition).toBe("50% 34%");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expectHeroNameOnOneLine(page);
  await page
    .locator(".home-hero__portrait")
    .evaluate((image) =>
      image instanceof HTMLImageElement ? image.decode() : Promise.resolve(),
    );
  const mobileLayout = await page.evaluate(() => {
    const getRect = (selector: string) => {
      const element = document.querySelector(selector);
      if (element === null) throw new Error(`Missing ${selector}.`);
      const { height, width, y } = element.getBoundingClientRect();
      return { height, width, y };
    };
    return {
      heading: getRect(".home-hero h1"),
      introduction: getRect(".home-hero__positioning"),
      portrait: getRect(".home-hero__portrait-frame"),
      role: getRect(".home-hero__eyebrow"),
    };
  });
  expect(mobileLayout.portrait.y).toBeLessThan(mobileLayout.heading.y);
  expect(mobileLayout.heading.y).toBeLessThan(mobileLayout.role.y);
  expect(mobileLayout.role.y).toBeLessThan(mobileLayout.introduction.y);
  expect(
    Math.abs(mobileLayout.portrait.width - mobileLayout.portrait.height),
  ).toBeLessThan(0.01);
  expect(mobileLayout.portrait.width).toBeLessThanOrEqual(192);
  await expect(portraitFrame).toHaveCSS("border-radius", "50%");

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expectHeroNameOnOneLine(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expectHeroNameOnOneLine(page, 36);
});

test("body prose is justified and social icons align with their labels", async ({
  page,
}) => {
  const runtimeProblems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      runtimeProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    runtimeProblems.push(`pageerror: ${error.message}`);
  });

  for (const { colorScheme, viewport } of [
    {
      colorScheme: "light" as const,
      viewport: { width: 1280, height: 900 },
    },
    {
      colorScheme: "dark" as const,
      viewport: { width: 390, height: 844 },
    },
  ]) {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize(viewport);
    await page.goto("/");

    for (const selector of [
      ".home-hero__positioning",
      ".home-about__copy p",
      ".home-credibility .ui-section-heading__description p",
      ".credibility-list__detail",
      ".home-contact .ui-section-heading__description p",
    ]) {
      const paragraphs = page.locator(selector);
      for (const paragraph of await paragraphs.all()) {
        await expect(paragraph).toHaveCSS("text-align", "justify");
      }
    }

    await page
      .getByRole("heading", { level: 2, name: "Start a useful conversation" })
      .scrollIntoViewIfNeeded();
    for (const platform of ["GitHub", "LinkedIn"]) {
      const link = page.getByRole("link", {
        name: `${platform} (opens in a new tab)`,
      });
      const alignment = await link.evaluate((element) => {
        const icon = element.querySelector<HTMLElement>(
          ".contact-actions__social-icon",
        );
        const label = element.querySelector<HTMLElement>(
          ".contact-actions__social-label",
        );
        if (icon === null || label === null) return undefined;
        const iconRect = icon.getBoundingClientRect();
        const labelRect = label.getBoundingClientRect();
        return {
          centerDifference: Math.abs(
            iconRect.top +
              iconRect.height / 2 -
              (labelRect.top + labelRect.height / 2),
          ),
          display: getComputedStyle(element).display,
          iconLineHeight: getComputedStyle(icon).lineHeight,
        };
      });
      expect(alignment?.display).toBe("inline-flex");
      expect(alignment?.iconLineHeight).toBe("0px");
      expect(alignment?.centerDifference).toBeLessThanOrEqual(0.5);
    }
  }

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  for (const selector of [
    ".home-hero__positioning",
    ".home-about__copy p",
    ".home-credibility .ui-section-heading__description p",
    ".credibility-list__detail",
    ".home-contact .ui-section-heading__description p",
  ]) {
    const paragraphs = page.locator(selector);
    for (const paragraph of await paragraphs.all()) {
      await expect(paragraph).toHaveCSS("text-align", "left");
    }
  }

  expect(runtimeProblems).toEqual([]);
});

test("mobile menu supports Escape, focus restoration, and route navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const openMenu = page.getByRole("button", { name: "Open navigation" });
  await expect(openMenu).toBeVisible();
  await openMenu.click();

  const closeMenu = page.getByRole("button", { name: "Close navigation" });
  await expect(closeMenu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(openMenu).toBeFocused();
  await expect(openMenu).toHaveAttribute("aria-expanded", "false");

  await openMenu.click();
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Writings" })
    .click();
  await expect(page).toHaveURL(/\/writings$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Writings" }),
  ).toBeVisible();
  await expect(openMenu).toHaveAttribute("aria-expanded", "false");
});

test("skip link and theme controls work from the keyboard and persist", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  const theme = page.getByRole("radiogroup", { name: "Site theme" });
  await expect(theme).toHaveAttribute("data-presentation", "compact");
  await theme.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-preference",
    "dark",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await theme.getByRole("radio", { name: "System" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-preference",
    "system",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("compact theme options expose stable tooltips and roving keyboard controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const theme = page.getByRole("radiogroup", { name: "Site theme" });
  const light = theme.getByRole("radio", { name: "Light" });
  const dark = theme.getByRole("radio", { name: "Dark" });
  const system = theme.getByRole("radio", { name: "System" });

  await expect(theme.locator(".ui-theme-toggle__label")).toHaveCount(3);
  for (const option of [light, dark, system]) {
    const box = await option.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await expect(option).not.toHaveAttribute("title");
  }

  await light.hover();
  await expect(theme.getByRole("tooltip", { name: "Light" })).toBeVisible();

  await dark.focus();
  await expect(theme.getByRole("tooltip", { name: "Dark" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(system).toBeFocused();
  await expect(system).toHaveAttribute("aria-checked", "true");
  await expect(theme.getByRole("tooltip", { name: "System" })).toBeVisible();

  const indicators = await system.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      borderStyle: styles.borderTopStyle,
      borderWidth: styles.borderTopWidth,
      outlineOffset: styles.outlineOffset,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
    };
  });
  expect(indicators.borderStyle).toBe("solid");
  expect(Number.parseFloat(indicators.borderWidth)).toBeGreaterThanOrEqual(2);
  expect(indicators.outlineStyle).toBe("solid");
  expect(Number.parseFloat(indicators.outlineWidth)).toBeGreaterThanOrEqual(3);
  expect(Number.parseFloat(indicators.outlineOffset)).toBeGreaterThan(0);
});

test("compact theme controls retain selected and focus indicators in forced colors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(() => matchMedia("(forced-colors: active)").matches),
    )
    .toBe(true);

  const theme = page.getByRole("radiogroup", { name: "Site theme" });
  const dark = theme.getByRole("radio", { name: "Dark" });
  const system = theme.getByRole("radio", { name: "System" });
  await system.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(dark).toBeFocused();
  await expect(dark).toHaveAttribute("aria-checked", "true");

  const indicators = await dark.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      borderStyle: styles.borderTopStyle,
      borderWidth: styles.borderTopWidth,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
    };
  });
  expect(indicators.borderStyle).toBe("solid");
  expect(Number.parseFloat(indicators.borderWidth)).toBeGreaterThanOrEqual(2);
  expect(indicators.outlineStyle).toBe("solid");
  expect(Number.parseFloat(indicators.outlineWidth)).toBeGreaterThanOrEqual(3);
  await expect(theme.getByRole("tooltip", { name: "Dark" })).toBeVisible();
});

test("contact details, compact actions, outbound links, and approved resume work", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");
  await page
    .getByRole("heading", { level: 2, name: "Start a useful conversation" })
    .scrollIntoViewIfNeeded();

  const emailLink = page.locator('.contact-actions a[href^="mailto:"]');
  const copyEmail = page.getByRole("button", {
    name: "Copy email address",
  });
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute("href", /^mailto:/);
  await copyEmail.focus();
  await expect(page.getByRole("tooltip", { name: "Copy email" })).toBeVisible();
  await expectMinimumTarget(copyEmail);
  await copyEmail.click();
  await expect(page.getByRole("status")).toHaveText("Email address copied.");

  const phoneLink = page.locator('.contact-actions a[href^="tel:"]');
  await expect(phoneLink).toBeVisible();
  await expect(phoneLink).toHaveAttribute("href", /^tel:/);
  await expect(
    page.getByRole("button", { name: /show phone number/i }),
  ).toHaveCount(0);
  await expect(page.getByText("Bangalore, Mumbai, India")).toBeVisible();

  for (const platform of ["GitHub", "LinkedIn"]) {
    const link = page.getByRole("link", {
      name: `${platform} (opens in a new tab)`,
    });
    await expect(link).toHaveAttribute(
      "href",
      platform === "GitHub"
        ? /^https:\/\/github\.com\//
        : /^https:\/\/linkedin\.com\//,
    );
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link.locator("svg")).toHaveCount(1);
    await expectMinimumTarget(link);
  }
  await expect(page.locator("form")).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download resume" }).last().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("rahul-yadav-resume.pdf");
  const downloadPath = await download.path();
  const bytes = await readFile(downloadPath);
  const productionBytes = await readFile(
    "build/client/assets/resume/rahul-yadav-resume.pdf",
  );
  expect(bytes).toEqual(productionBytes);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(resumeSha256);
});

test("credibility case notes stay a cohesive rule-separated list at every width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page
    .getByRole("heading", { level: 2, name: "Evidence over adjectives" })
    .scrollIntoViewIfNeeded();

  const notes = page.locator(".credibility-list > li");
  await expect(notes).toHaveCount(5);
  await expect(notes.locator(".credibility-list__lead")).toHaveCount(5);
  await expect(notes.locator(".credibility-list__detail")).toHaveCount(5);
  await expect(
    page.getByText(
      "Helped raise backend test coverage by ~45 percentage points (~40% to ~85%).",
      { exact: true },
    ),
  ).toBeVisible();

  const editorialStyles = await page.evaluate(() => {
    const list = document.querySelector<HTMLElement>(".credibility-list");
    const item = document.querySelector<HTMLElement>(".credibility-list > li");
    if (list === null || item === null) return undefined;
    const listStyle = getComputedStyle(list);
    const itemStyle = getComputedStyle(item);
    return {
      columns: listStyle.gridTemplateColumns.split(" ").length,
      itemBackground: itemStyle.backgroundColor,
      itemBorderLeft: itemStyle.borderLeftWidth,
      itemBorderRight: itemStyle.borderRightWidth,
      itemBoxShadow: itemStyle.boxShadow,
      ruleStyle: itemStyle.borderBottomStyle,
    };
  });
  expect(editorialStyles).toEqual({
    columns: 1,
    itemBackground: "rgba(0, 0, 0, 0)",
    itemBorderLeft: "0px",
    itemBorderRight: "0px",
    itemBoxShadow: "none",
    ruleStyle: "solid",
  });
  await expect(page.locator(".home-credibility .ui-card")).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page
    .getByRole("heading", { level: 2, name: "Evidence over adjectives" })
    .scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
});

test("expanded, compact, menu, and contact states have no axe violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page
    .getByRole("heading", { level: 2, name: "Start a useful conversation" })
    .scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Copy email address" }).focus();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("responsive and 320px stress states do not overflow", async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expectNoHorizontalOverflow(page);
    await page
      .getByRole("heading", { level: 2, name: "Start a useful conversation" })
      .scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);

    if (viewport.width < 768) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expectNoHorizontalOverflow(page);
      await page.keyboard.press("Escape");
    }
  }
});

test("Back to top works by keyboard, mouse, touch, and after route navigation", async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await scrollToDocumentBottom(page);

  const backToTop = page.getByRole("link", { name: "Back to top" });
  await expect(backToTop).toHaveAttribute("href", "#top");
  await backToTop.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expect(page.locator("#top")).toBeFocused();
  expect(new URL(page.url()).hash).toBe("");

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await scrollToDocumentBottom(page);
  await page.getByRole("link", { name: "Back to top" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expect(page.locator("#top")).toBeFocused();
  expect(new URL(page.url()).hash).toBe("");

  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto("/");
  await scrollToDocumentBottom(touchPage);
  const touchLink = touchPage.getByRole("link", { name: "Back to top" });
  const touchBox = await touchLink.boundingBox();
  if (touchBox === null)
    throw new Error("Back to top touch target is missing.");
  await touchPage.touchscreen.tap(
    touchBox.x + touchBox.width / 2,
    touchBox.y + touchBox.height / 2,
  );
  await expect
    .poll(() => touchPage.evaluate(() => window.scrollY))
    .toBeLessThan(2);
  await expect(touchPage.locator("#top")).toBeFocused();
  await touchContext.close();
});

test("reduced motion simplifies the compact-identity transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const transitionMilliseconds = await page
    .locator(".compact-identity")
    .evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(", ")
        .map((duration) =>
          duration.endsWith("ms")
            ? Number.parseFloat(duration)
            : Number.parseFloat(duration) * 1000,
        ),
    );
  expect(Math.max(...transitionMilliseconds)).toBeLessThanOrEqual(0.01);
});

test("the prerendered shell remains navigable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Rahul Yadav" }),
  ).toBeVisible();
  const primary = page.getByRole("navigation", { name: "Primary" });
  await expect(primary).toBeVisible();
  await expect(primary.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download resume" }).first(),
  ).toBeVisible();
  await expect(page.locator('.contact-actions a[href^="tel:"]')).toBeVisible();

  await scrollToDocumentBottom(page);
  const backToTop = page.getByRole("link", { name: "Back to top" });
  await expect(backToTop).toHaveAttribute("href", "#top");
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  expect(new URL(page.url()).hash).toBe("#top");

  await context.close();
});
