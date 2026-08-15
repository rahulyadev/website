/**
 * This function must remain self-contained because its serialized source runs
 * in the document head before the stylesheet is discovered.
 */
export function initializeThemeBeforePaint() {
  const root = document.documentElement;
  let preference: "light" | "dark" | "system" = "system";

  try {
    const storedPreference = window.localStorage.getItem(
      "rahuly-theme-preference",
    );

    if (
      storedPreference === "light" ||
      storedPreference === "dark" ||
      storedPreference === "system"
    ) {
      preference = storedPreference;
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }

  let systemPrefersDark = false;

  try {
    systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
  } catch {
    // Light is the safe fallback when matchMedia is unavailable.
  }

  const effectiveTheme =
    preference === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : preference;

  root.dataset["themePreference"] = preference;
  root.dataset["theme"] = effectiveTheme;
  root.style.colorScheme = effectiveTheme;
}

export const THEME_BOOTSTRAP_SCRIPT = `(${initializeThemeBeforePaint.toString()})();`;
