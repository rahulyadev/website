import AxeBuilder from "@axe-core/playwright";

import { expect, test, type Page } from "@playwright/test";

const contentSectionIds = [
  "about",
  "credibility",
  "experience",
  "skills",
  "education",
  "contact",
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const result = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    return {
      clientWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -0.5 || rect.right > clientWidth + 0.5;
        })
        .slice(0, 12)
        .map((element) => ({
          className: element.className,
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
          tagName: element.tagName,
          text: element.textContent.trim().slice(0, 80),
        })),
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(
    result.scrollWidth,
    JSON.stringify(result, undefined, 2),
  ).toBeLessThanOrEqual(result.clientWidth);
}

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
}

async function expectHeadingFirstSections(page: Page) {
  const sections = await page
    .locator(".home-page > .ui-section")
    .evaluateAll((elements) =>
      elements.map((section) => {
        const inner = section.firstElementChild;
        if (
          !(inner instanceof HTMLElement) ||
          !inner.classList.contains("home-section__inner")
        ) {
          throw new Error(
            `Section ${section.id} is missing its inner wrapper.`,
          );
        }

        const heading = inner.children[0];
        const content = inner.children[1];
        if (
          !(heading instanceof HTMLElement) ||
          !(content instanceof HTMLElement)
        ) {
          throw new Error(
            `Section ${section.id} is missing its heading or content.`,
          );
        }

        const innerRect = inner.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        return {
          childCount: section.children.length,
          contentLeft: contentRect.left,
          contentRight: contentRect.right,
          contentTop: contentRect.top,
          firstChildClass: heading.className,
          headingBottom: headingRect.bottom,
          headingLeft: headingRect.left,
          headingRight: headingRect.right,
          id: section.id,
          innerLeft: innerRect.left,
          innerRight: innerRect.right,
          innerWidth: innerRect.width,
        };
      }),
    );

  expect(sections.map(({ id }) => id)).toEqual(contentSectionIds);
  for (const section of sections) {
    expect(section.childCount).toBe(1);
    expect(section.firstChildClass).toContain("ui-section-heading");
    expect(section.contentTop).toBeGreaterThan(section.headingBottom);
    expect(
      Math.abs(section.headingLeft - section.innerLeft),
    ).toBeLessThanOrEqual(0.75);
    expect(
      Math.abs(section.headingRight - section.innerRight),
    ).toBeLessThanOrEqual(0.75);
    expect(
      Math.abs(section.contentLeft - section.innerLeft),
    ).toBeLessThanOrEqual(0.75);
    expect(
      Math.abs(section.contentRight - section.innerRight),
    ).toBeLessThanOrEqual(0.75);
  }
}

test("home renders the approved professional structure and exact public inventory", async ({
  page,
}) => {
  await page.goto("/");

  expect(
    await page
      .locator(".home-page > section")
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual([
    "",
    "about",
    "credibility",
    "experience",
    "skills",
    "education",
    "contact",
  ]);
  await expectHeadingFirstSections(page);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 2, name: "Experience" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Skills" }),
  ).toBeAttached();
  await expect(
    page.getByRole("heading", { level: 2, name: "Education" }),
  ).toBeAttached();

  const credibilityCards = page.locator(
    ".credibility-list > .credibility-list__item",
  );
  await expect(credibilityCards).toHaveCount(3);
  await expect(credibilityCards.getByRole("heading", { level: 3 })).toHaveText([
    "Phased application modernization",
    "Greenfield product delivery",
    "Leadership and measurable outcomes",
  ]);
  await expect(page.locator(".credibility-list__outcomes > li")).toHaveCount(3);
  await expect(
    page.getByText(
      "Co-designed a PHP-to-FastAPI/React modernization for the Airbus engagement at Sopra Steria, using Strangler Fig routing and AWS ALB URL rewrites to avoid a big-bang cutover.",
    ),
  ).toBeAttached();
  await expect(
    page.getByText(
      "Delivered four greenfield modules at Gainfront—Request for Price, Target Report, Spend Analytics, and Itemized Quote—from requirements through release using Django REST Framework and Vue/Quasar.",
    ),
  ).toBeAttached();

  const timeline = page.getByRole("list", {
    name: "Professional experience in reverse chronological order",
  });
  await expect(timeline).toHaveCount(1);
  await expect(timeline.locator(":scope > li")).toHaveCount(3);
  await expect(timeline.getByRole("heading", { level: 3 })).toHaveText([
    "Sopra Steria",
    "Gainfront",
    "MarsDevs",
  ]);
  await expect(timeline.locator('[data-featured="true"]')).toHaveCount(2);
  await expect(
    timeline.getByRole("img", { name: "Featured experience" }),
  ).toHaveCount(2);
  await expect(
    timeline.locator('[role="tooltip"]', { hasText: "Featured experience" }),
  ).toHaveCount(2);
  await expect(timeline.getByRole("heading", { level: 4 })).toHaveText([
    "Senior Software Engineer",
    "Software Developer",
    "Software Engineer",
  ]);
  for (const location of [
    "Bengaluru, Karnataka, India",
    "Pune, Maharashtra, India",
  ]) {
    await expect(timeline.getByText(location).first()).toBeAttached();
  }
  await expect(timeline.getByText("Bengaluru, Karnataka, India")).toHaveCount(
    2,
  );
  await expect(timeline.getByText(/Customer engagement:\s*Airbus/)).toHaveCount(
    1,
  );
  await expect(timeline.getByRole("heading", { name: "Airbus" })).toHaveCount(
    0,
  );
  await expect(
    timeline.getByText(/full-stack features for Polestar/i),
  ).toBeAttached();
  await expect(
    timeline.getByText(/Castapp video-generation time/i),
  ).toBeAttached();
  await expect(
    timeline.getByText(/Afto.*TyreExpress.*Medtrics/i),
  ).toBeAttached();
  await expect(
    timeline.locator(".experience-role__contributions strong"),
  ).toHaveCount(24);
  for (const phrase of [
    "Strangler Fig pattern",
    "AWS ALB listener-rule URL rewrite transforms",
    "4 greenfield modules",
    "Python/Flask processing and GCP task orchestration",
    "35%",
  ]) {
    await expect(
      timeline.locator("strong").filter({ hasText: phrase }),
    ).toHaveCount(1);
  }

  const skillItems = page.locator(".skill-group > ul > li");
  await expect(page.locator(".skill-group")).toHaveCount(6);
  await expect(
    page.locator(".skill-group__icon[aria-hidden='true']"),
  ).toHaveCount(6);
  await expect(skillItems).toHaveCount(44);
  const skills = await skillItems.allTextContents();
  expect(new Set(skills).size).toBe(44);
  expect(skills).not.toContain("PHP");

  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Bachelor of Engineering in Computer Engineering",
    }),
  ).toBeAttached();
  await expect(page.getByText("University of Mumbai")).toBeAttached();
  await expect(page.getByText(/2016–2020.*CGPA 8\.74\/10/)).toBeAttached();
  await expect(page.getByText(/Thakur College/i)).toHaveCount(0);

  const logos = page.locator(".organization-logo img");
  await expect(logos).toHaveCount(4);
  for (const logo of await logos.all()) {
    await expect(logo).toHaveAttribute("alt", "");
    await logo.scrollIntoViewIfNeeded();
    await logo.evaluate((image) =>
      image instanceof HTMLImageElement ? image.decode() : Promise.resolve(),
    );
    expect(
      await logo.evaluate((image) => {
        if (!(image instanceof HTMLImageElement)) return undefined;
        return {
          complete: image.complete,
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
        };
      }),
    ).toEqual({ complete: true, naturalHeight: 200, naturalWidth: 200 });
  }
  await expect(page.locator(".experience-entry__header a")).toHaveCount(0);
  await expect(page.locator(".education-record a")).toHaveCount(0);
  await expect(page.getByText("Bengaluru, Mumbai - India")).toBeAttached();
  await expect(
    page.getByText("Made with ❤️ in India · Thank you for visiting."),
  ).toBeAttached();
});

test("content sections share one centered width owner with aligned bodies", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 900, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expectHeadingFirstSections(page);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const sectionGeometry = await page
    .locator(".home-section__inner")
    .evaluateAll((inners) =>
      inners.map((inner) => {
        const rect = inner.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }),
    );
  expect(sectionGeometry).toHaveLength(contentSectionIds.length);
  for (const geometry of sectionGeometry) {
    expect(geometry.width).toBeLessThanOrEqual(60 * 16 + 0.5);
    expect(
      Math.abs(geometry.left - (1440 - geometry.right)),
    ).toBeLessThanOrEqual(0.5);
  }
  expect(
    new Set(sectionGeometry.map(({ left }) => Math.round(left))),
  ).toHaveProperty("size", 1);

  const timelineGeometry = await page
    .locator(".experience-timeline")
    .evaluate((timeline) => {
      const inner = timeline.closest(".home-section__inner");
      const heading = inner?.querySelector(":scope > .ui-section-heading");
      const entry = timeline.querySelector(":scope > .experience-entry");
      const content = entry?.querySelector(
        ":scope > .experience-entry__content",
      );
      if (
        !(inner instanceof HTMLElement) ||
        !(heading instanceof HTMLElement) ||
        !(entry instanceof HTMLElement) ||
        !(content instanceof HTMLElement)
      ) {
        throw new Error("Experience geometry is incomplete.");
      }
      const timelineRect = timeline.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      return {
        contentIndent: contentRect.left - timelineRect.left,
        entryBorderTop: getComputedStyle(entry).borderTopWidth,
        entryPseudoContent: getComputedStyle(entry, "::before").content,
        headingLeft: headingRect.left,
        headingRight: headingRect.right,
        innerLeft: innerRect.left,
        innerRight: innerRect.right,
        timelineLeft: timelineRect.left,
        timelineRight: timelineRect.right,
      };
    });
  expect(
    Math.abs(timelineGeometry.timelineLeft - timelineGeometry.headingLeft),
  ).toBeLessThanOrEqual(0.75);
  expect(
    Math.abs(timelineGeometry.timelineRight - timelineGeometry.headingRight),
  ).toBeLessThanOrEqual(0.75);
  expect(
    Math.abs(timelineGeometry.timelineLeft - timelineGeometry.innerLeft),
  ).toBeLessThanOrEqual(0.75);
  expect(
    Math.abs(timelineGeometry.timelineRight - timelineGeometry.innerRight),
  ).toBeLessThanOrEqual(0.75);
  expect(timelineGeometry.contentIndent).toBeGreaterThan(0);
  expect(timelineGeometry.contentIndent).toBeLessThanOrEqual(32.5);
  expect(timelineGeometry.entryBorderTop).toBe("0px");
  expect(timelineGeometry.entryPseudoContent).toBe("none");

  for (const selector of [
    ".home-hero__copy",
    ".home-hero__positioning",
    ".home-about__copy",
    ".experience-role__summary",
    ".experience-role__contributions",
    ".education-list",
    ".contact-actions",
  ]) {
    await expect(page.locator(selector).first()).toHaveCSS("max-width", "none");
  }

  for (const paragraph of await page.locator(".home-page p").all()) {
    await expect(paragraph).toHaveCSS("max-width", "none");
  }

  const heroCopyGeometry = await page
    .locator(".home-hero__copy")
    .evaluate((copy) => {
      const positioning = copy.querySelector(".home-hero__positioning");
      if (!(positioning instanceof HTMLElement)) {
        throw new Error("Hero positioning copy is missing.");
      }
      const copyRect = copy.getBoundingClientRect();
      const positioningRect = positioning.getBoundingClientRect();
      return {
        copyLeft: copyRect.left,
        copyRight: copyRect.right,
        positioningLeft: positioningRect.left,
        positioningRight: positioningRect.right,
      };
    });
  expect(heroCopyGeometry.positioningLeft).toBeCloseTo(
    heroCopyGeometry.copyLeft,
    1,
  );
  expect(heroCopyGeometry.positioningRight).toBeCloseTo(
    heroCopyGeometry.copyRight,
    1,
  );
});

test("experience headers prioritize designation while preserving semantic order and timeline geometry", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 900, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const geometry = await page
      .locator(".experience-timeline")
      .evaluate((timeline) => {
        const timelineStyles = getComputedStyle(timeline, "::before");
        return {
          entries: [...timeline.querySelectorAll(".experience-entry")].map(
            (entry) => {
              const header = entry.querySelector(".experience-entry__header");
              const content = entry.querySelector(".experience-entry__content");
              const identity = entry.querySelector(
                ".experience-entry__identity-copy",
              );
              const logo = entry.querySelector(".organization-logo");
              const marker = entry.querySelector(".experience-entry__marker");
              const metadata = entry.querySelector(
                ".experience-role__metadata",
              );
              const company = entry.querySelector(
                ".experience-entry__identity-copy h3",
              );
              const titleRow = entry.querySelector(
                ".experience-role__title-row",
              );
              const designation = titleRow?.querySelector("h4");
              const dates = metadata?.querySelector(".experience-role__dates");
              const location = metadata?.querySelector(
                ".experience-role__location",
              );
              const featured = titleRow?.querySelector(
                ".experience-entry__featured",
              );
              if (
                !(header instanceof HTMLElement) ||
                !(content instanceof HTMLElement) ||
                !(identity instanceof HTMLElement) ||
                !(logo instanceof HTMLElement) ||
                !(marker instanceof HTMLElement) ||
                !(metadata instanceof HTMLElement) ||
                !(company instanceof HTMLElement) ||
                !(titleRow instanceof HTMLElement) ||
                !(designation instanceof HTMLElement) ||
                !(dates instanceof HTMLElement) ||
                !(location instanceof HTMLElement)
              ) {
                throw new Error("Experience employer header is incomplete.");
              }
              const contentRect = content.getBoundingClientRect();
              const identityRect = identity.getBoundingClientRect();
              const logoRect = logo.getBoundingClientRect();
              const markerRect = marker.getBoundingClientRect();
              const metadataRect = metadata.getBoundingClientRect();
              const companyRect = company.getBoundingClientRect();
              const designationRect = designation.getBoundingClientRect();
              const datesRect = dates.getBoundingClientRect();
              const locationRect = location.getBoundingClientRect();
              const featuredRect = featured?.getBoundingClientRect();
              return {
                companyFontSize: Number.parseFloat(
                  getComputedStyle(company).fontSize,
                ),
                companyTop: companyRect.top,
                contentLeft: contentRect.left,
                contentRight: contentRect.right,
                dateBottom: datesRect.bottom,
                designationBottom: designationRect.bottom,
                designationFontSize: Number.parseFloat(
                  getComputedStyle(designation).fontSize,
                ),
                domHeadingOrder:
                  (company.compareDocumentPosition(designation) &
                    Node.DOCUMENT_POSITION_FOLLOWING) !==
                  0,
                entryBorderTop: getComputedStyle(entry).borderTopWidth,
                entryPseudoContent: getComputedStyle(entry, "::before").content,
                featuredParentClass: featured?.parentElement?.className ?? null,
                featuredPreviousTag:
                  featured?.previousElementSibling?.tagName ?? null,
                featuredTop: featuredRect?.top ?? null,
                headerColumnCount: getComputedStyle(header)
                  .gridTemplateColumns.trim()
                  .split(/\s+/).length,
                identityLeft: identityRect.left,
                identityRight: identityRect.right,
                locationTop: locationRect.top,
                logoCenter: logoRect.top + logoRect.height / 2,
                markerCenter: markerRect.top + markerRect.height / 2,
                metadataLeft: metadataRect.left,
                metadataRight: metadataRect.right,
                metadataTextAlign: getComputedStyle(metadata).textAlign,
                titleChildCount: titleRow.children.length,
              };
            },
          ),
          timelineBackground: timelineStyles.backgroundColor,
          timelineBottom: timelineStyles.bottom,
          timelineContent: timelineStyles.content,
          timelineTop: timelineStyles.top,
        };
      });

    expect(geometry.timelineContent).not.toBe("none");
    expect(geometry.timelineBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(geometry.timelineTop)).toBeGreaterThan(0);
    expect(Number.parseFloat(geometry.timelineBottom)).toBeGreaterThan(0);
    expect(geometry.entries).toHaveLength(3);
    for (const [index, entry] of geometry.entries.entries()) {
      expect(entry.headerColumnCount).toBe(3);
      expect(entry.entryBorderTop).toBe("0px");
      expect(entry.entryPseudoContent).toBe("none");
      expect(entry.domHeadingOrder).toBe(true);
      expect(entry.designationFontSize).toBeGreaterThan(entry.companyFontSize);
      expect(entry.designationBottom).toBeLessThanOrEqual(
        entry.companyTop + 0.5,
      );
      expect(entry.dateBottom).toBeLessThanOrEqual(entry.locationTop + 0.5);
      expect(
        Math.abs(entry.markerCenter - entry.logoCenter),
      ).toBeLessThanOrEqual(1);
      expect(entry.identityLeft).toBeGreaterThan(entry.contentLeft);
      expect(entry.metadataRight).toBeCloseTo(entry.contentRight, 1);
      expect(entry.identityRight).toBeLessThan(entry.metadataLeft);
      expect(entry.metadataTextAlign).toBe("right");
      if (index < 2) {
        expect(entry.featuredParentClass).toBe("experience-role__title-row");
        expect(entry.featuredPreviousTag).toBe("H4");
        expect(entry.featuredTop).not.toBeNull();
        expect(entry.titleChildCount).toBe(2);
      } else {
        expect(entry.featuredParentClass).toBeNull();
        expect(entry.featuredPreviousTag).toBeNull();
        expect(entry.featuredTop).toBeNull();
        expect(entry.titleChildCount).toBe(1);
      }
    }
    for (const details of await page
      .locator(".experience-role__contributions details")
      .all()) {
      await expect(details).toHaveCSS("border-top-width", "0px");
    }
  }

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const mobileHeaders = await page
      .locator(".experience-entry")
      .evaluateAll((entries) =>
        entries.map((entry) => {
          const header = entry.querySelector(".experience-entry__header");
          const identity = entry.querySelector(
            ".experience-entry__identity-copy",
          );
          const titleRow = entry.querySelector(".experience-role__title-row");
          const designation = titleRow?.querySelector("h4");
          const company = identity?.querySelector("h3");
          const logo = entry.querySelector(".organization-logo");
          const marker = entry.querySelector(".experience-entry__marker");
          const metadata = entry.querySelector(".experience-role__metadata");
          const dates = metadata?.querySelector(".experience-role__dates");
          const location = metadata?.querySelector(
            ".experience-role__location",
          );
          const featured = titleRow?.querySelector(
            ".experience-entry__featured",
          );
          if (
            !(header instanceof HTMLElement) ||
            !(identity instanceof HTMLElement) ||
            !(titleRow instanceof HTMLElement) ||
            !(designation instanceof HTMLElement) ||
            !(company instanceof HTMLElement) ||
            !(logo instanceof HTMLElement) ||
            !(marker instanceof HTMLElement) ||
            !(metadata instanceof HTMLElement) ||
            !(dates instanceof HTMLElement) ||
            !(location instanceof HTMLElement)
          ) {
            throw new Error("Mobile experience header is incomplete.");
          }
          const headerRect = header.getBoundingClientRect();
          const identityRect = identity.getBoundingClientRect();
          const designationRect = designation.getBoundingClientRect();
          const companyRect = company.getBoundingClientRect();
          const logoRect = logo.getBoundingClientRect();
          const markerRect = marker.getBoundingClientRect();
          const metadataRect = metadata.getBoundingClientRect();
          const datesRect = dates.getBoundingClientRect();
          const locationRect = location.getBoundingClientRect();
          const featuredRect = featured?.getBoundingClientRect();
          return {
            companyBottom: companyRect.bottom,
            companyFontSize: Number.parseFloat(
              getComputedStyle(company).fontSize,
            ),
            companyTop: companyRect.top,
            dateBottom: datesRect.bottom,
            dateTop: datesRect.top,
            designationBottom: designationRect.bottom,
            designationFontSize: Number.parseFloat(
              getComputedStyle(designation).fontSize,
            ),
            featuredRight: featuredRect?.right ?? null,
            featuredTop: featuredRect?.top ?? null,
            headerColumnCount: getComputedStyle(header)
              .gridTemplateColumns.trim()
              .split(/\s+/).length,
            headerRight: headerRect.right,
            identityBottom: identityRect.bottom,
            identityLeft: identityRect.left,
            locationTop: locationRect.top,
            logoCenter: logoRect.top + logoRect.height / 2,
            markerCenter: markerRect.top + markerRect.height / 2,
            metadataLeft: metadataRect.left,
            metadataTextAlign: getComputedStyle(metadata).textAlign,
            metadataTop: metadataRect.top,
            titleChildCount: titleRow.children.length,
          };
        }),
      );
    for (const [index, header] of mobileHeaders.entries()) {
      expect(header.headerColumnCount).toBe(2);
      expect(header.designationFontSize).toBeGreaterThan(
        header.companyFontSize,
      );
      expect(header.designationBottom).toBeLessThanOrEqual(
        header.companyTop + 0.5,
      );
      expect(header.metadataTop).toBeGreaterThanOrEqual(header.identityBottom);
      expect(header.companyBottom).toBeLessThanOrEqual(header.dateTop + 0.5);
      expect(header.dateBottom).toBeLessThanOrEqual(header.locationTop + 0.5);
      expect(header.metadataLeft).toBeCloseTo(header.identityLeft, 1);
      expect(header.metadataTextAlign).toBe("left");
      expect(
        Math.abs(header.markerCenter - header.logoCenter),
      ).toBeLessThanOrEqual(1);
      if (index < 2) {
        expect(header.featuredTop).not.toBeNull();
        expect(
          header.featuredRight ?? Number.POSITIVE_INFINITY,
        ).toBeLessThanOrEqual(header.headerRight + 0.5);
        expect(header.titleChildCount).toBe(2);
      } else {
        expect(header.featuredTop).toBeNull();
        expect(header.featuredRight).toBeNull();
        expect(header.titleChildCount).toBe(1);
      }
    }
    await expectNoHorizontalOverflow(page);
  }
});

test("featured experience indicators expose stable tooltips and honor motion preferences", async ({
  page,
}) => {
  await page.goto("/");

  const indicators = page.getByRole("img", { name: "Featured experience" });
  await expect(indicators).toHaveCount(2);
  await expect(
    page
      .locator(".experience-entry")
      .filter({ hasText: "MarsDevs" })
      .locator(".experience-entry__featured"),
  ).toHaveCount(0);

  const indicator = indicators.first();
  const tooltip = indicator.getByRole("tooltip", {
    name: "Featured experience",
  });
  await expect(indicator.locator("svg[aria-hidden='true']")).toHaveCount(1);
  await expect(indicator.locator("svg")).toHaveCSS(
    "animation-name",
    "experience-featured-pulse",
  );
  const readTitleRowGeometry = () =>
    indicator.locator("xpath=..").evaluate((row) => {
      const rect = row.getBoundingClientRect();
      return {
        height: rect.height,
        left: rect.left,
        top: rect.top + window.scrollY,
        width: rect.width,
      };
    });
  const titleRowBefore = await readTitleRowGeometry();

  await indicator.hover();
  await expect(tooltip).toHaveText("Featured experience");
  await expect(tooltip).toHaveCSS("visibility", "visible");
  const titleRowAfterHover = await readTitleRowGeometry();
  expect(titleRowAfterHover).toEqual(titleRowBefore);

  await page.mouse.move(0, 0);
  await indicator.focus();
  await expect(indicator).toBeFocused();
  await expect(tooltip).toHaveCSS("visibility", "visible");
  const titleRowAfterFocus = await readTitleRowGeometry();
  expect(titleRowAfterFocus).toEqual(titleRowBefore);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const reducedIndicator = page
    .getByRole("img", { name: "Featured experience" })
    .first();
  await expect(reducedIndicator.locator("svg")).toHaveCSS(
    "animation-name",
    "none",
  );

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.reload();
  const forcedIndicator = page
    .getByRole("img", { name: "Featured experience" })
    .first();
  await forcedIndicator.focus();
  await expect(forcedIndicator.locator("svg")).toBeVisible();
  await expect(forcedIndicator).toHaveCSS("forced-color-adjust", "none");
  await expect(
    forcedIndicator.getByRole("tooltip", { name: "Featured experience" }),
  ).toHaveCSS("visibility", "visible");
});

test("hero portrait remains circular and undistorted at every target width", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 900, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const geometry = await page
      .locator(".home-hero__portrait-frame")
      .evaluate((frame) => {
        const image = frame.querySelector(".home-hero__portrait");
        const heading = document.querySelector(".home-hero h1");
        const role = document.querySelector(".home-hero__eyebrow");
        if (!(image instanceof HTMLImageElement)) {
          throw new Error("Hero portrait is missing.");
        }
        if (
          !(heading instanceof HTMLElement) ||
          !(role instanceof HTMLElement)
        ) {
          throw new Error("Hero typography is missing.");
        }
        const lineCount = (element: HTMLElement) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return new Set(
            [...range.getClientRects()].map((rect) => Math.round(rect.top)),
          ).size;
        };
        const frameRect = frame.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const frameStyles = getComputedStyle(frame);
        const imageStyles = getComputedStyle(image);
        const headingRect = heading.getBoundingClientRect();
        const roleRect = role.getBoundingClientRect();
        return {
          aspectRatio: frameStyles.aspectRatio,
          borderInlineWidth:
            Number.parseFloat(frameStyles.borderLeftWidth) +
            Number.parseFloat(frameStyles.borderRightWidth),
          borderBlockWidth:
            Number.parseFloat(frameStyles.borderTopWidth) +
            Number.parseFloat(frameStyles.borderBottomWidth),
          borderRadius: frameStyles.borderRadius,
          currentSrc: image.currentSrc,
          frameHeight: frameRect.height,
          frameWidth: frameRect.width,
          headingFontSize: Number.parseFloat(
            getComputedStyle(heading).fontSize,
          ),
          headingLineCount: lineCount(heading),
          headingRight: headingRect.right,
          imageHeight: imageRect.height,
          imageWidth: imageRect.width,
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
          objectFit: imageStyles.objectFit,
          objectPosition: imageStyles.objectPosition,
          roleFontSize: Number.parseFloat(getComputedStyle(role).fontSize),
          roleLetterSpacing: Number.parseFloat(
            getComputedStyle(role).letterSpacing,
          ),
          roleLineCount: lineCount(role),
          roleRight: roleRect.right,
          viewportWidth: document.documentElement.clientWidth,
        };
      });
    const expectedPortraitWidth = Math.min(
      Math.max(9 * 16, viewport.width * 0.22),
      18 * 16,
    );
    const expectedHeadingSize = Math.min(
      Math.max(2.75 * 16, viewport.width * 0.05),
      5.25 * 16,
    );
    const expectedRoleSize = Math.min(
      Math.max(0.95 * 16, 0.88 * 16 + viewport.width * 0.003),
      1.15 * 16,
    );
    expect(geometry.aspectRatio).toBe("1 / 1");
    expect(geometry.borderRadius).toBe("50%");
    expect(geometry.frameWidth).toBeCloseTo(expectedPortraitWidth, 1);
    expect(geometry.frameWidth).toBeCloseTo(geometry.frameHeight, 1);
    expect(geometry.imageWidth).toBeCloseTo(
      geometry.frameWidth - geometry.borderInlineWidth,
      1,
    );
    expect(geometry.imageHeight).toBeCloseTo(
      geometry.frameHeight - geometry.borderBlockWidth,
      1,
    );
    expect(geometry.objectFit).toBe("cover");
    expect(geometry.objectPosition).toBe("50% 34%");
    expect(geometry.headingFontSize).toBeCloseTo(expectedHeadingSize, 1);
    expect(geometry.headingLineCount).toBe(1);
    expect(geometry.headingRight).toBeLessThanOrEqual(
      geometry.viewportWidth + 0.5,
    );
    expect(geometry.roleFontSize).toBeCloseTo(expectedRoleSize, 1);
    expect(geometry.roleLetterSpacing).toBeCloseTo(expectedRoleSize * 0.08, 2);
    expect(geometry.roleLineCount).toBe(1);
    expect(geometry.roleRight).toBeLessThanOrEqual(
      geometry.viewportWidth + 0.5,
    );
    expect(geometry.naturalWidth).toBeGreaterThanOrEqual(geometry.frameWidth);
    expect(geometry.naturalHeight).toBeGreaterThanOrEqual(geometry.frameHeight);
    expect(geometry.currentSrc).toMatch(
      /rahul-yadav-portrait-(?:400|640|800)\.(?:avif|webp|jpe?g)$/,
    );
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const mobileOrder = await page.locator(".home-hero").evaluate((hero) => {
    const portrait = hero.querySelector(".home-hero__portrait-frame");
    const copy = hero.querySelector(".home-hero__copy");
    if (!(portrait instanceof HTMLElement) || !(copy instanceof HTMLElement)) {
      throw new Error("Hero composition is incomplete.");
    }
    return {
      copyTop: copy.getBoundingClientRect().top,
      portraitBottom: portrait.getBoundingClientRect().bottom,
    };
  });
  expect(mobileOrder.copyTop).toBeGreaterThanOrEqual(
    mobileOrder.portraitBottom,
  );
});

test("credibility forms two concise cards and one full-width outcomes card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const wide = await page.locator(".credibility-list").evaluate((list) => {
    const listRect = list.getBoundingClientRect();
    const items = [...list.children].map((item) => {
      const marker = item.querySelector(".credibility-list__index");
      if (!(marker instanceof HTMLElement)) {
        throw new Error("Credibility marker is missing.");
      }
      const rect = item.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        display: getComputedStyle(item).display,
        left: rect.left,
        markerDisplay: getComputedStyle(marker).display,
        markerHeight: markerRect.height,
        markerWidth: markerRect.width,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      };
    });
    return {
      columnCount: getComputedStyle(list)
        .gridTemplateColumns.trim()
        .split(/\s+/).length,
      items,
      listLeft: listRect.left,
      listRight: listRect.right,
      listWidth: listRect.width,
    };
  });
  expect(wide.columnCount).toBe(2);
  expect(wide.items).toHaveLength(3);
  expect(wide.items[0]?.top).toBeCloseTo(wide.items[1]?.top ?? 0, 1);
  expect(wide.items[0]?.bottom).toBeCloseTo(wide.items[1]?.bottom ?? 0, 1);
  expect(wide.items[0]?.width).toBeCloseTo(wide.items[1]?.width ?? 0, 1);
  expect(wide.items[2]?.left).toBeCloseTo(wide.listLeft, 1);
  expect(wide.items[2]?.right).toBeCloseTo(wide.listRight, 1);
  expect(wide.items[2]?.width).toBeCloseTo(wide.listWidth, 1);
  for (const item of wide.items) {
    expect(item.display).toBe("block");
    expect(item.markerDisplay).toBe("grid");
    expect(item.markerWidth).toBeCloseTo(32, 1);
    expect(item.markerHeight).toBeCloseTo(32, 1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const mobile = await page.locator(".credibility-list").evaluate((list) => {
    const listRect = list.getBoundingClientRect();
    return {
      columnCount: getComputedStyle(list)
        .gridTemplateColumns.trim()
        .split(/\s+/).length,
      items: [...list.children].map((item) => {
        const rect = item.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
        };
      }),
      listLeft: listRect.left,
      listRight: listRect.right,
      listWidth: listRect.width,
    };
  });
  expect(mobile.columnCount).toBe(1);
  expect(mobile.items).toHaveLength(3);
  for (const item of mobile.items) {
    expect(item.left).toBeCloseTo(mobile.listLeft, 1);
    expect(item.right).toBeCloseTo(mobile.listRight, 1);
    expect(item.width).toBeCloseTo(mobile.listWidth, 1);
  }
});

test("skills use six full-width editorial rows with natural inline separators", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 900, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const backendSkills = page
      .locator(".skill-group")
      .filter({ hasText: "Backend and APIs" })
      .locator("ul");
    await expect(backendSkills).toHaveCSS("display", "block");
    const rowTops = await backendSkills
      .locator(":scope > li")
      .evaluateAll((items) =>
        items.map((item) => Math.round(item.getBoundingClientRect().top)),
      );
    const rowCount = new Set(rowTops).size;
    expect(rowCount).toBeGreaterThan(1);
    expect(rowCount).toBeLessThan(rowTops.length);

    const skillLabels = page.locator(".skill-group__skills > li");
    await expect(skillLabels).toHaveCount(44);
    const labels = await skillLabels.allTextContents();
    expect(new Set(labels)).toHaveProperty("size", 44);
    expect(labels).not.toContain("PHP");

    const firstSkill = page.locator(".skill-group__skills > li").first();
    const lastSkill = page.locator(".skill-group__skills > li").last();
    expect(
      await firstSkill.evaluate(
        (item) => getComputedStyle(item, "::before").content,
      ),
    ).toBe("none");
    expect(
      await firstSkill.evaluate(
        (item) => getComputedStyle(item, "::after").content,
      ),
    ).toContain(",");
    expect(
      await lastSkill.evaluate(
        (item) => getComputedStyle(item, "::after").content,
      ),
    ).toBe("none");

    await page.addStyleTag({
      content: ".skill-group__icon { display: none !important; }",
    });
    for (const label of await skillLabels.all())
      await expect(label).toBeVisible();

    const groupGeometry = await page
      .locator(".skill-groups")
      .evaluate((list) => {
        const listRect = list.getBoundingClientRect();
        return [...list.children].map((group) => {
          const rect = group.getBoundingClientRect();
          const heading = group.querySelector(".skill-group__heading");
          const skills = group.querySelector(".skill-group__skills");
          if (
            !(heading instanceof HTMLElement) ||
            !(skills instanceof HTMLElement)
          ) {
            throw new Error("Skill group structure is incomplete.");
          }
          const headingRect = heading.getBoundingClientRect();
          const skillsRect = skills.getBoundingClientRect();
          const styles = getComputedStyle(group);
          return {
            alignItems: styles.alignItems,
            borderBottomWidth: styles.borderBottomWidth,
            borderTopWidth: styles.borderTopWidth,
            columnCount: styles.gridTemplateColumns.trim().split(/\s+/).length,
            headingCenter: headingRect.top + headingRect.height / 2,
            headingBottom: headingRect.bottom,
            left: rect.left,
            right: rect.right,
            skillsCenter: skillsRect.top + skillsRect.height / 2,
            skillsTop: skillsRect.top,
            top: rect.top,
            bottom: rect.bottom,
            listLeft: listRect.left,
            listRight: listRect.right,
          };
        });
      });
    expect(groupGeometry).toHaveLength(6);
    for (const [index, geometry] of groupGeometry.entries()) {
      expect(geometry.left).toBeCloseTo(geometry.listLeft, 1);
      expect(geometry.right).toBeCloseTo(geometry.listRight, 1);
      expect(geometry.columnCount).toBe(viewport.width >= 768 ? 2 : 1);
      expect(geometry.borderBottomWidth).toBe("0px");
      expect(geometry.borderTopWidth).toBe(index === 0 ? "0px" : "1px");
      if (viewport.width >= 768) {
        expect(geometry.alignItems).toBe("center");
        expect(
          Math.abs(geometry.headingCenter - geometry.skillsCenter),
        ).toBeLessThanOrEqual(1);
      } else {
        expect(geometry.alignItems).toBe("start");
        expect(geometry.skillsTop).toBeGreaterThanOrEqual(
          geometry.headingBottom,
        );
      }
      if (index > 0) {
        expect(geometry.top).toBeCloseTo(
          groupGeometry[index - 1]?.bottom ?? 0,
          1,
        );
      }
    }
  }
});

test("prose and section labels use the approved typography", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 900, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    for (const selector of [
      ".home-hero__positioning",
      ".home-about__copy p:first-child",
      ".home-credibility .ui-section-heading__description p",
      ".credibility-list__detail",
      ".credibility-list__outcomes li",
      ".home-experience .ui-section-heading__description p",
      ".experience-role__summary",
      ".experience-role__contributions li",
      ".home-contact .ui-section-heading__description p",
    ]) {
      const paragraph = page.locator(selector).first();
      await expect(paragraph).toHaveCSS("text-align", "justify");
      await expect(paragraph).toHaveCSS("hyphens", "auto");
      await expect(paragraph).toHaveCSS("overflow-wrap", "break-word");
    }

    const eyebrowSizes = await page
      .locator(".home-page > .ui-section .ui-section-heading__eyebrow")
      .evaluateAll((labels) =>
        labels.map((label) =>
          Number.parseFloat(getComputedStyle(label).fontSize),
        ),
      );
    expect(eyebrowSizes).toHaveLength(contentSectionIds.length);
    expect(new Set(eyebrowSizes.map((size) => size.toFixed(2)))).toHaveProperty(
      "size",
      1,
    );
    const expectedEyebrowSize = Math.min(
      Math.max(0.9 * 16, 0.86 * 16 + viewport.width * 0.0016),
      16,
    );
    for (const size of eyebrowSizes)
      expect(size).toBeCloseTo(expectedEyebrowSize, 1);

    const headingSizes = await page
      .locator(".home-page > .ui-section .ui-section-heading__title")
      .evaluateAll((headings) =>
        headings.map((heading) => {
          const rect = heading.getBoundingClientRect();
          return {
            fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
            right: rect.right,
            viewportWidth: document.documentElement.clientWidth,
          };
        }),
      );
    const expectedHeadingSize = Math.min(
      Math.max(2 * 16, 1.7 * 16 + viewport.width * 0.012),
      2.75 * 16,
    );
    for (const heading of headingSizes) {
      expect(heading.fontSize).toBeCloseTo(expectedHeadingSize, 1);
      expect(heading.right).toBeLessThanOrEqual(heading.viewportWidth + 0.5);
    }
  }

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const selector of [
      ".home-about__copy p:first-child",
      ".credibility-list__detail",
      ".credibility-list__outcomes li",
      ".experience-role__summary",
      ".experience-role__contributions li",
      ".home-contact .ui-section-heading__description p",
    ]) {
      const prose = page.locator(selector).first();
      await expect(prose).toHaveCSS("text-align", "left");
      await expect(prose).toHaveCSS("hyphens", "none");
      await expect(prose).toHaveCSS("overflow-wrap", "break-word");
    }
    const mobileHeadingMetrics = await page
      .locator(".home-page > .ui-section .ui-section-heading__title")
      .evaluateAll((headings) =>
        headings.map((heading) => {
          const rect = heading.getBoundingClientRect();
          return {
            fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
            left: rect.left,
            right: rect.right,
            viewportWidth: document.documentElement.clientWidth,
          };
        }),
      );
    for (const heading of mobileHeadingMetrics) {
      expect(heading.fontSize).toBeCloseTo(32, 1);
      expect(heading.left).toBeGreaterThanOrEqual(0);
      expect(heading.right).toBeLessThanOrEqual(heading.viewportWidth + 0.5);
    }
    await expectNoHorizontalOverflow(page);
  }
});

test("contact uses the approved two-by-two grid and compact accessible profiles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const theme of ["light", "dark"]) {
    await page.goto("/");
    await page.evaluate((preference) => {
      localStorage.setItem("rahuly-theme-preference", preference);
    }, theme);
    await page.reload();

    await expect(page.getByText("Bengaluru, Mumbai - India")).toBeAttached();
    await expect(page.locator(".contact-actions__row > dt")).toHaveText([
      "Email",
      "Phone",
      "Profiles",
      "Location",
    ]);

    const wide = await page.locator(".contact-actions").evaluate((contact) => {
      const details = contact.querySelector(".contact-actions__details");
      const list = details?.querySelector("dl");
      const rows = ["email", "phone", "profiles", "location"].map((name) => {
        const row = contact.querySelector(`.contact-actions__row--${name}`);
        if (!(row instanceof HTMLElement)) {
          throw new Error(`Missing ${name} contact row.`);
        }
        const rect = row.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };
      });
      if (!(details instanceof HTMLElement) || !(list instanceof HTMLElement)) {
        throw new Error("Contact details are missing.");
      }
      const contactRect = contact.getBoundingClientRect();
      const detailsRect = details.getBoundingClientRect();
      return {
        contactLeft: contactRect.left,
        contactRight: contactRect.right,
        detailsLeft: detailsRect.left,
        detailsRight: detailsRect.right,
        gridAreas: getComputedStyle(list).gridTemplateAreas,
        overflow: getComputedStyle(contact).overflow,
        rows,
      };
    });
    expect(wide.detailsLeft).toBeCloseTo(wide.contactLeft, 1);
    expect(wide.detailsRight).toBeCloseTo(wide.contactRight, 1);
    expect(wide.gridAreas).toContain("email profiles");
    expect(wide.gridAreas).toContain("phone location");
    expect(wide.overflow).toBe("visible");
    const [email, phone, profiles, location] = wide.rows;
    if (
      email === undefined ||
      phone === undefined ||
      profiles === undefined ||
      location === undefined
    ) {
      throw new Error("Contact geometry is incomplete.");
    }
    expect(email.top).toBeCloseTo(profiles.top, 1);
    expect(email.bottom).toBeCloseTo(profiles.bottom, 1);
    expect(phone.top).toBeCloseTo(location.top, 1);
    expect(phone.bottom).toBeCloseTo(location.bottom, 1);
    expect(email.width).toBeCloseTo(profiles.width, 1);
    expect(phone.width).toBeCloseTo(location.width, 1);
    expect(phone.top).toBeCloseTo(email.bottom, 1);
    expect(location.top).toBeCloseTo(profiles.bottom, 1);

    const profileActions = page.locator(
      ".contact-actions__profile-row > a, .contact-actions__profile-row .contact-actions__social-link",
    );
    await expect(profileActions).toHaveCount(3);
    const actionGeometry = await profileActions.evaluateAll((actions) =>
      actions.map((action) => {
        const rect = action.getBoundingClientRect();
        return {
          center: rect.top + rect.height / 2,
          height: rect.height,
          left: rect.left,
          width: rect.width,
        };
      }),
    );
    expect(actionGeometry[0]?.left).toBeLessThan(actionGeometry[1]?.left ?? 0);
    expect(actionGeometry[1]?.left).toBeLessThan(actionGeometry[2]?.left ?? 0);
    expect(actionGeometry[1]?.width).toBeGreaterThanOrEqual(44);
    expect(actionGeometry[1]?.height).toBeGreaterThanOrEqual(44);
    expect(actionGeometry[2]?.width).toBeGreaterThanOrEqual(44);
    expect(actionGeometry[2]?.height).toBeGreaterThanOrEqual(44);
    expect(
      Math.max(...actionGeometry.map(({ center }) => center)) -
        Math.min(...actionGeometry.map(({ center }) => center)),
    ).toBeLessThanOrEqual(0.5);

    const github = page.getByRole("link", {
      name: "GitHub (opens in a new tab)",
    });
    const linkedin = page.getByRole("link", {
      name: "LinkedIn (opens in a new tab)",
    });
    await expect(page.locator(".contact-actions__social-label")).toHaveCount(0);
    for (const link of [github, linkedin]) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      await expect(link.locator("svg")).toHaveCount(1);
    }

    await github.hover();
    const githubTooltip = page.getByRole("tooltip", { name: "GitHub" });
    await expect(githubTooltip).toHaveCSS("visibility", "visible");
    const tooltipRect = await githubTooltip.boundingBox();
    expect(tooltipRect?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect(
      (tooltipRect?.x ?? 1441) + (tooltipRect?.width ?? 0),
    ).toBeLessThanOrEqual(1440);

    await linkedin.focus();
    await expect(linkedin).toBeFocused();
    await expect(page.getByRole("tooltip", { name: "LinkedIn" })).toHaveCSS(
      "visibility",
      "visible",
    );
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const mobileRows = await page
    .locator(".contact-actions__row")
    .evaluateAll((rows) =>
      rows.map((row) => {
        const rect = row.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top };
      }),
    );
  expect(mobileRows).toHaveLength(4);
  for (const [index, row] of mobileRows.entries()) {
    if (index > 0) {
      expect(row.top).toBeGreaterThan(mobileRows[index - 1]?.top ?? 0);
    }
    expect(row.left).toBeCloseTo(mobileRows[0]?.left ?? 0, 1);
    expect(row.right).toBeCloseTo(mobileRows[0]?.right ?? 0, 1);
  }

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  const compactRow = await page
    .locator(".contact-actions__profile-row")
    .evaluate((row) => {
      const rect = row.getBoundingClientRect();
      const actions = [
        ...row.querySelectorAll(":scope > a, a.contact-actions__social-link"),
      ];
      return {
        clientWidth: row.clientWidth,
        centers: actions.map((action) => {
          const actionRect = action.getBoundingClientRect();
          return actionRect.top + actionRect.height / 2;
        }),
        rowWidth: rect.width,
        scrollWidth: row.scrollWidth,
      };
    });
  expect(compactRow.scrollWidth).toBeLessThanOrEqual(compactRow.clientWidth);
  expect(
    Math.max(...compactRow.centers) - Math.min(...compactRow.centers),
  ).toBeLessThanOrEqual(0.5);
  await expectNoHorizontalOverflow(page);
});

test("education, Contact, and footer use only the approved boundaries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const wideBoundaries = await page.evaluate(() => {
    const education = document.querySelector(".education-record");
    const contact = document.querySelector(".contact-actions");
    const location = document.querySelector(".contact-actions__row--location");
    if (
      !(education instanceof HTMLElement) ||
      !(contact instanceof HTMLElement) ||
      !(location instanceof HTMLElement)
    ) {
      throw new Error("Education or Contact boundary is missing.");
    }
    return {
      contactBottom: getComputedStyle(contact).borderBottomWidth,
      educationBottom: getComputedStyle(education).borderBottomWidth,
      educationTop: getComputedStyle(education).borderTopWidth,
      locationBottom: getComputedStyle(location).borderBottomWidth,
    };
  });
  expect(wideBoundaries.educationTop).toBe("0px");
  expect(wideBoundaries.educationBottom).toBe("0px");
  expect(wideBoundaries.contactBottom).toBe("1px");
  expect(wideBoundaries.locationBottom).toBe("0px");

  const footerMessage = page.locator(".site-footer__message");
  await expect(page.locator(".site-footer__identity")).toHaveCount(0);
  await expect(footerMessage).toHaveText(
    "Made with ❤️ in India · Thank you for visiting.",
  );
  await expect(footerMessage.getByRole("img", { name: "love" })).toBeVisible();
  const wideFooter = await page
    .locator(".site-footer__inner")
    .evaluate((inner) => {
      const navigation = inner.querySelector(":scope > nav");
      const navigationList = navigation?.querySelector("ul");
      const message = inner.querySelector(":scope > .site-footer__message");
      if (
        !(navigation instanceof HTMLElement) ||
        !(navigationList instanceof HTMLElement) ||
        !(message instanceof HTMLElement)
      ) {
        throw new Error("Footer structure is incomplete.");
      }
      const innerRect = inner.getBoundingClientRect();
      const navigationRect = navigation.getBoundingClientRect();
      const navigationListRect = navigationList.getBoundingClientRect();
      const messageRect = message.getBoundingClientRect();
      return {
        childClasses: [...inner.children].map((child) => child.className),
        columnCount: getComputedStyle(inner)
          .gridTemplateColumns.trim()
          .split(/\s+/).length,
        innerCenter: innerRect.left + innerRect.width / 2,
        messageLeft: messageRect.left,
        messageCenter: messageRect.top + messageRect.height / 2,
        messageRight: messageRect.right,
        navigationListLeft: navigationListRect.left,
        navigationCenter: navigationRect.top + navigationRect.height / 2,
        navigationLeft: navigationRect.left,
        navigationRight: navigationRect.right,
      };
    });
  expect(wideFooter.childClasses).toEqual(["", "site-footer__message"]);
  expect(wideFooter.columnCount).toBe(2);
  expect(wideFooter.navigationLeft).toBeCloseTo(
    wideFooter.navigationListLeft,
    1,
  );
  expect(wideFooter.navigationRight).toBeLessThan(wideFooter.messageLeft);
  expect(wideFooter.navigationLeft).toBeLessThan(wideFooter.innerCenter);
  expect(wideFooter.messageRight).toBeGreaterThan(wideFooter.innerCenter);
  expect(
    Math.abs(wideFooter.navigationCenter - wideFooter.messageCenter),
  ).toBeLessThanOrEqual(1);

  for (const viewport of [
    { width: 900, height: 900, textScale: 1 },
    { width: 390, height: 844, textScale: 1 },
    { width: 320, height: 640, textScale: 1 },
    { width: 640, height: 900, textScale: 2 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    if (viewport.textScale === 2) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
    }
    const stacked = await page.evaluate(() => {
      const contact = document.querySelector(".contact-actions");
      const location = document.querySelector(
        ".contact-actions__row--location",
      );
      const footer = document.querySelector(".site-footer__inner");
      const navigation = footer?.querySelector(":scope > nav");
      const navigationList = navigation?.querySelector("ul");
      const message = footer?.querySelector(":scope > .site-footer__message");
      if (
        !(contact instanceof HTMLElement) ||
        !(location instanceof HTMLElement) ||
        !(footer instanceof HTMLElement) ||
        !(navigation instanceof HTMLElement) ||
        !(navigationList instanceof HTMLElement) ||
        !(message instanceof HTMLElement)
      ) {
        throw new Error("Stacked footer structure is incomplete.");
      }
      const footerRect = footer.getBoundingClientRect();
      const navigationRect = navigation.getBoundingClientRect();
      const navigationListRect = navigationList.getBoundingClientRect();
      const messageRect = message.getBoundingClientRect();
      const linksByRow = new Map<number, DOMRect[]>();
      for (const link of navigationList.querySelectorAll("a")) {
        const rect = link.getBoundingClientRect();
        const row = Math.round(rect.top);
        const links = linksByRow.get(row) ?? [];
        links.push(rect);
        linksByRow.set(row, links);
      }
      return {
        columnCount: getComputedStyle(footer)
          .gridTemplateColumns.trim()
          .split(/\s+/).length,
        contactBottom: getComputedStyle(contact).borderBottomWidth,
        footerCenter: footerRect.left + footerRect.width / 2,
        lastChildClass: footer.lastElementChild?.className ?? null,
        locationBottom: getComputedStyle(location).borderBottomWidth,
        locationTop: getComputedStyle(location).borderTopWidth,
        messageCenter: messageRect.left + messageRect.width / 2,
        messageTextAlign: getComputedStyle(message).textAlign,
        messageTop: messageRect.top,
        navigationBottom: navigationRect.bottom,
        navigationCenter:
          navigationListRect.left + navigationListRect.width / 2,
        navigationJustification:
          getComputedStyle(navigationList).justifyContent,
        navigationRowCenters: [...linksByRow.values()].map(
          (links) =>
            (Math.min(...links.map((rect) => rect.left)) +
              Math.max(...links.map((rect) => rect.right))) /
            2,
        ),
      };
    });
    expect(stacked.columnCount).toBe(1);
    expect(stacked.contactBottom).toBe(viewport.width >= 768 ? "1px" : "0px");
    expect(stacked.locationTop).toBe("1px");
    expect(stacked.locationBottom).toBe("0px");
    expect(stacked.navigationBottom).toBeLessThanOrEqual(stacked.messageTop);
    expect(stacked.navigationJustification).toBe("center");
    expect(stacked.navigationCenter).toBeCloseTo(stacked.footerCenter, 1);
    expect(stacked.messageCenter).toBeCloseTo(stacked.footerCenter, 1);
    expect(stacked.messageTextAlign).toBe("center");
    expect(stacked.lastChildClass).toBe("site-footer__message");
    for (const rowCenter of stacked.navigationRowCenters) {
      expect(rowCenter).toBeCloseTo(stacked.footerCenter, 1);
    }
    await expectNoHorizontalOverflow(page);
  }
});

test("native contribution disclosures work by keyboard and remain accessible", async ({
  page,
}) => {
  await page.goto("/");
  const details = page.locator(".experience-role__contributions details");
  await expect(details).toHaveCount(2);
  await expectNoSeriousAxeViolations(page);

  const firstSummary = details.first().locator("summary");
  const collapsedGeometry = await details.first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const contributions = element.closest(".experience-role__contributions");
    if (!(contributions instanceof HTMLElement)) {
      throw new Error("Contribution container is missing.");
    }
    const contributionsRect = contributions.getBoundingClientRect();
    return {
      contributionLeft: contributionsRect.left,
      contributionRight: contributionsRect.right,
      detailsLeft: rect.left,
      detailsRight: rect.right,
    };
  });
  await firstSummary.focus();
  await expect(firstSummary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(details.first()).toHaveAttribute("open", "");
  await expect(details.first().locator("ol")).toHaveAttribute("start", "4");
  const expandedGeometry = await details.first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right };
  });
  expect(collapsedGeometry.detailsLeft).toBeCloseTo(
    collapsedGeometry.contributionLeft,
    1,
  );
  expect(collapsedGeometry.detailsRight).toBeCloseTo(
    collapsedGeometry.contributionRight,
    1,
  );
  expect(expandedGeometry.left).toBeCloseTo(collapsedGeometry.detailsLeft, 1);
  expect(expandedGeometry.right).toBeCloseTo(collapsedGeometry.detailsRight, 1);
  await expectNoSeriousAxeViolations(page);

  await page.keyboard.press("Enter");
  await expect(details.first()).not.toHaveAttribute("open", "");
});

test("professional sections reflow at 320px and 200 percent text without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");

  await expect(page.locator(".skill-group > ul > li")).toHaveCount(44);
  await expect(
    page.getByRole("heading", { level: 3, name: "Sopra Steria" }),
  ).toBeAttached();
  await expect(page.getByText("University of Mumbai")).toBeAttached();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 640, height: 900 });
  await page.reload();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expectHeadingFirstSections(page);
  await expectNoHorizontalOverflow(page);
});

test("organization identity survives a failed logo request", async ({
  page,
}) => {
  await page.route("**/assets/organizations/gainfront.jpeg", (route) =>
    route.abort(),
  );
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 3, name: "Gainfront" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 4, name: "Software Developer" }),
  ).toBeVisible();
});

test("professional sections honor system theme, forced colors, and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "dark",
    forcedColors: "active",
    reducedMotion: "reduce",
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("rahuly-theme-preference", "system");
  });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-preference",
    "system",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          matchMedia("(forced-colors: active)").matches &&
          matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    )
    .toBe(true);
  await expect(page.locator(".organization-logo").first()).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expectNoHorizontalOverflow(page);
});

test("professional content and native disclosure remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? "http://127.0.0.1:4173",
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 2, name: "Experience" }),
    ).toBeVisible();
    await expect(page.locator(".skill-group > ul > li")).toHaveCount(44);
    await expect(page.getByText("University of Mumbai")).toBeAttached();
    await expect(page.locator(".credibility-list__item")).toHaveCount(3);
    await expect(
      page.locator(".experience-role__contributions strong"),
    ).toHaveCount(24);
    await expect(page.getByText("Bengaluru, Mumbai - India")).toBeAttached();
    await expect(
      page.getByText("Made with ❤️ in India · Thank you for visiting."),
    ).toBeAttached();
    const featured = page
      .getByRole("img", { name: "Featured experience" })
      .first();
    await expect(
      page.getByRole("img", { name: "Featured experience" }),
    ).toHaveCount(2);
    await featured.hover();
    await expect(
      featured.getByRole("tooltip", { name: "Featured experience" }),
    ).toHaveCSS("visibility", "visible");

    const details = page
      .locator(".experience-role__contributions details")
      .first();
    await expect(details).not.toHaveAttribute("open", "");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.locator("li")).toHaveCount(3);
  } finally {
    await context.close();
  }
});
