import { expect, test, type Locator, type Page } from "@playwright/test";

import { THEME_STORAGE_KEY } from "../../app/theme-config";

interface FirstPaintThemeCase {
  effectiveTheme: "light" | "dark";
  heading: string;
  path: string;
  preference: "light" | "dark" | "system";
  systemTheme: "light" | "dark";
}

interface ThemeIndicatorStyles {
  backgroundColor: string;
  borderColor: string;
  borderStyle: string;
  borderWidth: number;
  height: number;
  outlineColor: string;
  outlineOffset: number;
  outlineStyle: string;
  outlineWidth: number;
  trackColor: string;
}

const firstPaintThemeCases: FirstPaintThemeCase[] = [
  {
    effectiveTheme: "light",
    heading: "Rahul Yadav",
    path: "/",
    preference: "light",
    systemTheme: "dark",
  },
  {
    effectiveTheme: "dark",
    heading: "Projects",
    path: "/projects",
    preference: "dark",
    systemTheme: "light",
  },
  {
    effectiveTheme: "dark",
    heading: "Writings",
    path: "/writings",
    preference: "system",
    systemTheme: "dark",
  },
  {
    effectiveTheme: "light",
    heading: "Rahul Yadav",
    path: "/",
    preference: "system",
    systemTheme: "light",
  },
];

function parseRgbColor(color: string): [number, number, number] {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(color);

  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error(`Expected an RGB color, received: ${color}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance(color: string): number {
  const [red, green, blue] = parseRgbColor(color);
  const toLinearChannel = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    toLinearChannel(red) * 0.2126 +
    toLinearChannel(green) * 0.7152 +
    toLinearChannel(blue) * 0.0722
  );
}

function contrastRatio(firstColor: string, secondColor: string): number {
  const lighter = Math.max(
    relativeLuminance(firstColor),
    relativeLuminance(secondColor),
  );
  const darker = Math.min(
    relativeLuminance(firstColor),
    relativeLuminance(secondColor),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

async function mountThemeToggleStyleFixture(page: Page) {
  await page.getByRole("main").evaluate((main) => {
    const group = document.createElement("div");
    group.className = "ui-theme-toggle";
    group.setAttribute("aria-label", "Theme style fixture");
    group.setAttribute("role", "radiogroup");

    for (const mode of ["Light", "Dark", "System"]) {
      const option = document.createElement("button");
      const isSelected = mode === "Dark";

      option.className = "ui-theme-toggle__option";
      option.type = "button";
      option.setAttribute("aria-checked", String(isSelected));
      option.setAttribute("role", "radio");
      option.tabIndex = isSelected ? 0 : -1;
      option.textContent = mode;
      group.append(option);
    }

    const focusTarget = document.createElement("button");
    focusTarget.type = "button";
    focusTarget.textContent = "Focus target";
    main.prepend(group, focusTarget);
  });
}

async function readIndicatorStyles(
  option: Locator,
): Promise<ThemeIndicatorStyles> {
  return option.evaluate((element) => {
    const track = element.parentElement;

    if (!track) {
      throw new Error("Theme option is missing its track");
    }

    const style = getComputedStyle(element);
    const trackStyle = getComputedStyle(track);

    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderStyle: style.borderTopStyle,
      borderWidth: Number.parseFloat(style.borderTopWidth),
      height: element.getBoundingClientRect().height,
      outlineColor: style.outlineColor,
      outlineOffset: Number.parseFloat(style.outlineOffset),
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      trackColor: trackStyle.backgroundColor,
    };
  });
}

async function readForcedColorPalette(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    document.body.append(probe);

    probe.style.color = "Highlight";
    const highlight = getComputedStyle(probe).color;
    probe.style.color = "CanvasText";
    const canvasText = getComputedStyle(probe).color;
    probe.remove();

    return { canvasText, highlight };
  });
}

async function expectThemeBeforeHydration(
  page: Page,
  themeCase: FirstPaintThemeCase,
) {
  await page.emulateMedia({ colorScheme: themeCase.systemTheme });
  await page.addInitScript(
    ({ preference, storageKey }) => {
      window.localStorage.setItem(storageKey, preference);
    },
    { preference: themeCase.preference, storageKey: THEME_STORAGE_KEY },
  );
  await page.route(/\/assets\/.*\.js(?:\?.*)?$/, async (route) => {
    await route.abort();
  });

  await page.goto(themeCase.path, { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { level: 1, name: themeCase.heading }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-preference",
    themeCase.preference,
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    themeCase.effectiveTheme,
  );
  await expect(page.locator("html")).toHaveCSS(
    "color-scheme",
    themeCase.effectiveTheme,
  );

  const headOrder = await page.locator("head").evaluate((head) => {
    const children = [...head.children];
    const bootstrapIndex = children.findIndex(
      (element) =>
        element.tagName === "SCRIPT" &&
        element.textContent.includes("rahuly-theme-preference"),
    );
    const stylesheetIndex = children.findIndex(
      (element) =>
        element.tagName === "LINK" &&
        element.getAttribute("rel") === "stylesheet",
    );

    return { bootstrapIndex, stylesheetIndex };
  });

  expect(headOrder.bootstrapIndex).toBeGreaterThan(-1);
  expect(headOrder.stylesheetIndex).toBeGreaterThan(-1);
  expect(headOrder.bootstrapIndex).toBeLessThan(headOrder.stylesheetIndex);
}

for (const themeCase of firstPaintThemeCases) {
  test(`stored ${themeCase.preference} preference resolves to ${themeCase.effectiveTheme} before hydration on ${themeCase.path}`, async ({
    page,
  }) => {
    await expectThemeBeforeHydration(page, themeCase);
  });
}

test("the design-system query leaves the production home page intact", async ({
  page,
}) => {
  await page.goto("/?preview=design-system");

  await expect(
    page.getByRole("heading", { level: 1, name: "Rahul Yadav" }),
  ).toBeVisible();
  await expect(page.locator(".design-preview")).toHaveCount(0);
  await expect(
    page.getByText("Make complex work feel inevitable."),
  ).toHaveCount(0);
});

test("the selected theme indicator persists with sufficient light and dark contrast", async ({
  page,
}) => {
  await page.goto("/");
  await mountThemeToggleStyleFixture(page);

  const group = page.getByRole("radiogroup", { name: "Theme style fixture" });
  const selectedOption = group.getByRole("radio", { name: "Dark" });
  const unselectedOption = group.getByRole("radio", { name: "Light" });
  const focusTarget = page.getByRole("button", { name: "Focus target" });

  for (const theme of ["light", "dark"] as const) {
    await page.locator("html").evaluate((root, nextTheme) => {
      root.dataset["theme"] = nextTheme;
      root.style.colorScheme = nextTheme;
    }, theme);

    await expect
      .poll(async () => {
        const styles = await readIndicatorStyles(selectedOption);
        return Math.min(
          contrastRatio(styles.borderColor, styles.backgroundColor),
          contrastRatio(styles.borderColor, styles.trackColor),
        );
      })
      .toBeGreaterThanOrEqual(3);

    await focusTarget.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(selectedOption).toBeFocused();

    const focusedStyles = await readIndicatorStyles(selectedOption);
    const unselectedStyles = await readIndicatorStyles(unselectedOption);

    expect(focusedStyles.borderStyle).toBe("solid");
    expect(focusedStyles.borderWidth).toBeGreaterThanOrEqual(2);
    expect(focusedStyles.borderWidth).toBe(unselectedStyles.borderWidth);
    expect(focusedStyles.height).toBeGreaterThanOrEqual(44);
    expect(focusedStyles.outlineStyle).toBe("solid");
    expect(focusedStyles.outlineWidth).toBeGreaterThanOrEqual(3);
    expect(focusedStyles.outlineOffset).toBeGreaterThan(0);
    expect(focusedStyles.outlineColor).not.toBe(focusedStyles.borderColor);

    await focusTarget.focus();
    await expect(focusTarget).toBeFocused();
    await expect(selectedOption).not.toBeFocused();
    await expect(selectedOption).toHaveAttribute("aria-checked", "true");

    const unfocusedStyles = await readIndicatorStyles(selectedOption);

    expect(unfocusedStyles.borderColor).toBe(focusedStyles.borderColor);
    expect(
      contrastRatio(
        unfocusedStyles.borderColor,
        unfocusedStyles.backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(unfocusedStyles.borderColor, unfocusedStyles.trackColor),
    ).toBeGreaterThanOrEqual(3);
  }
});

test("the selected theme indicator remains distinct in forced colors without focus", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await mountThemeToggleStyleFixture(page);

  const group = page.getByRole("radiogroup", { name: "Theme style fixture" });
  const selectedOption = group.getByRole("radio", { name: "Dark" });
  const unselectedOption = group.getByRole("radio", { name: "Light" });
  const focusTarget = page.getByRole("button", { name: "Focus target" });
  const palette = await readForcedColorPalette(page);

  await focusTarget.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(selectedOption).toBeFocused();

  const focusedStyles = await readIndicatorStyles(selectedOption);

  expect(focusedStyles.borderColor).toBe(palette.highlight);
  expect(focusedStyles.outlineColor).toBe(palette.canvasText);
  expect(focusedStyles.outlineOffset).toBeGreaterThan(0);
  expect(focusedStyles.outlineColor).not.toBe(focusedStyles.borderColor);

  await focusTarget.focus();
  await expect(selectedOption).not.toBeFocused();
  await expect(selectedOption).toHaveAttribute("aria-checked", "true");

  const unfocusedStyles = await readIndicatorStyles(selectedOption);
  const unselectedStyles = await readIndicatorStyles(unselectedOption);

  expect(unfocusedStyles.borderStyle).toBe("solid");
  expect(unfocusedStyles.borderWidth).toBeGreaterThanOrEqual(2);
  expect(unfocusedStyles.borderWidth).toBe(unselectedStyles.borderWidth);
  expect(unfocusedStyles.borderColor).toBe(palette.highlight);
  expect(unfocusedStyles.borderColor).not.toBe(unselectedStyles.borderColor);
  expect(unfocusedStyles.height).toBeGreaterThanOrEqual(44);
});

test("reduced motion collapses foundation primitive transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const transitionDurations = await page
    .getByRole("link", { name: "Skip to content" })
    .evaluate((link) => getComputedStyle(link).transitionDuration);
  const transitionDurationMilliseconds = transitionDurations
    .split(", ")
    .map((value) =>
      value.endsWith("ms")
        ? Number.parseFloat(value)
        : Number.parseFloat(value) * 1000,
    );

  expect(Math.max(...transitionDurationMilliseconds)).toBeLessThanOrEqual(0.01);
});
