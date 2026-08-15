export const THEME_STORAGE_KEY = "rahuly-theme-preference";
export const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type EffectiveTheme = Exclude<ThemePreference, "system">;

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function parseThemePreference(value: unknown): ThemePreference {
  return typeof value === "string" &&
    THEME_PREFERENCES.some((preference) => preference === value)
    ? (value as ThemePreference)
    : "system";
}

export function readThemePreference(
  storage: ReadableStorage | undefined,
): ThemePreference {
  if (!storage) {
    return "system";
  }

  try {
    return parseThemePreference(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function persistThemePreference(
  storage: WritableStorage | undefined,
  preference: ThemePreference,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, preference);
    return true;
  } catch {
    return false;
  }
}

export function getEffectiveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): EffectiveTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function applyThemeToRoot(
  root: HTMLElement,
  preference: ThemePreference,
  effectiveTheme: EffectiveTheme,
) {
  root.dataset["themePreference"] = preference;
  root.dataset["theme"] = effectiveTheme;
  root.style.colorScheme = effectiveTheme;
}
