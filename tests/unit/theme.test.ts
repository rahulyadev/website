import { describe, expect, it } from "vitest";

import {
  THEME_STORAGE_KEY,
  getEffectiveTheme,
  parseThemePreference,
  persistThemePreference,
  readThemePreference,
} from "../../app/theme";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem(key: string) {
      expect(key).toBe(THEME_STORAGE_KEY);
      return value;
    },
    setItem(key: string, nextValue: string) {
      expect(key).toBe(THEME_STORAGE_KEY);
      value = nextValue;
    },
    value() {
      return value;
    },
  };
}

describe("theme preferences", () => {
  it.each([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "system"],
    ["sepia", "system"],
    [null, "system"],
    [undefined, "system"],
  ] as const)("parses %s as %s", (input, expected) => {
    expect(parseThemePreference(input)).toBe(expected);
  });

  it("reads and persists the explicit preference", () => {
    const storage = createMemoryStorage("dark");

    expect(readThemePreference(storage)).toBe("dark");
    expect(persistThemePreference(storage, "light")).toBe(true);
    expect(storage.value()).toBe("light");
  });

  it("falls back safely when storage is unavailable", () => {
    const inaccessibleStorage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };

    expect(readThemePreference(undefined)).toBe("system");
    expect(readThemePreference(inaccessibleStorage)).toBe("system");
    expect(persistThemePreference(undefined, "dark")).toBe(false);
    expect(persistThemePreference(inaccessibleStorage, "dark")).toBe(false);
  });

  it("resolves system preference without changing explicit modes", () => {
    expect(getEffectiveTheme("system", false)).toBe("light");
    expect(getEffectiveTheme("system", true)).toBe("dark");
    expect(getEffectiveTheme("light", true)).toBe("light");
    expect(getEffectiveTheme("dark", false)).toBe("dark");
  });
});
