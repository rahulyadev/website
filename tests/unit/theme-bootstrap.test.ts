import { runInNewContext } from "node:vm";

import { afterEach, describe, expect, it } from "vitest";
import { createThemeBootstrapScript } from "@rahulyadev/design-system/theme";

import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_STORAGE_KEY,
} from "../../app/theme-config";

function executeBootstrap(storedValue: string | null, matches: boolean) {
  runInNewContext(THEME_BOOTSTRAP_SCRIPT, {
    document,
    window: {
      localStorage: {
        getItem(key: string) {
          expect(key).toBe(THEME_STORAGE_KEY);
          return storedValue;
        },
      },
      matchMedia(query: string) {
        expect(query).toBe("(prefers-color-scheme: dark)");
        return { matches };
      },
    },
  });
}

afterEach(() => {
  delete document.documentElement.dataset["theme"];
  delete document.documentElement.dataset["themePreference"];
  delete document.documentElement.dataset["javascript"];
  document.documentElement.style.colorScheme = "";
});

describe("pre-paint theme initialization", () => {
  it("applies a stored explicit theme before application rendering", () => {
    executeBootstrap("dark", false);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute(
      "data-theme-preference",
      "dark",
    );
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement).toHaveAttribute(
      "data-javascript",
      "enabled",
    );
  });

  it("resolves system mode from the media preference", () => {
    executeBootstrap("system", true);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute(
      "data-theme-preference",
      "system",
    );
  });

  it("ignores invalid persisted values and falls back to system light", () => {
    executeBootstrap("invalid", false);

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute(
      "data-theme-preference",
      "system",
    );
  });

  it("exports a self-invoking bootstrap for the document head", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toBe(
      createThemeBootstrapScript({ storageKey: THEME_STORAGE_KEY }),
    );
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("document.documentElement");
    expect(THEME_BOOTSTRAP_SCRIPT).toMatch(/^\(function/);
    expect(THEME_BOOTSTRAP_SCRIPT).toMatch(/\)\(\);$/);
  });
});
