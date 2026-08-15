import { afterEach, describe, expect, it, vi } from "vitest";

import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_STORAGE_KEY,
  initializeThemeBeforePaint,
} from "../../app/theme";

function setSystemTheme(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches }));
}

afterEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset["theme"];
  delete document.documentElement.dataset["themePreference"];
  document.documentElement.style.colorScheme = "";
  vi.unstubAllGlobals();
});

describe("pre-paint theme initialization", () => {
  it("applies a stored explicit theme before application rendering", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    setSystemTheme(false);

    initializeThemeBeforePaint();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute(
      "data-theme-preference",
      "dark",
    );
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("resolves system mode from the media preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "system");
    setSystemTheme(true);

    initializeThemeBeforePaint();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute(
      "data-theme-preference",
      "system",
    );
  });

  it("ignores invalid persisted values and falls back to system light", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    setSystemTheme(false);

    initializeThemeBeforePaint();

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute(
      "data-theme-preference",
      "system",
    );
  });

  it("exports a self-invoking bootstrap for the document head", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("document.documentElement");
    expect(THEME_BOOTSTRAP_SCRIPT).toMatch(/^\(function/);
    expect(THEME_BOOTSTRAP_SCRIPT).toMatch(/\)\(\);$/);
  });
});
