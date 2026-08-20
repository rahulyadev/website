import { createThemeBootstrapScript } from "@rahulyadev/design-system/theme";

export const THEME_STORAGE_KEY = "rahuly-theme-preference";

export const THEME_BOOTSTRAP_SCRIPT = createThemeBootstrapScript({
  storageKey: THEME_STORAGE_KEY,
});
