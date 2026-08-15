import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  SYSTEM_THEME_QUERY,
  THEME_STORAGE_KEY,
  applyThemeToRoot,
  getEffectiveTheme,
  parseThemePreference,
  persistThemePreference,
  type EffectiveTheme,
  type ThemePreference,
} from "./theme";

interface ThemeContextValue {
  effectiveTheme: EffectiveTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const THEME_CHANGE_EVENT = "rahuly:theme-change";
const SERVER_THEME_SNAPSHOT = "system:light";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function getSystemPrefersDark() {
  if (typeof window.matchMedia !== "function") {
    return false;
  }

  try {
    return window.matchMedia(SYSTEM_THEME_QUERY).matches;
  } catch {
    return false;
  }
}

function getBrowserPreference() {
  const storage = getBrowserStorage();

  if (storage) {
    try {
      const storedPreference = storage.getItem(THEME_STORAGE_KEY);

      if (storedPreference !== null) {
        return parseThemePreference(storedPreference);
      }
    } catch {
      // The pre-paint data attribute remains the safe fallback.
    }
  }

  return parseThemePreference(
    document.documentElement.dataset["themePreference"],
  );
}

function getBrowserThemeSnapshot() {
  const preference = getBrowserPreference();
  const systemTheme = getSystemPrefersDark() ? "dark" : "light";

  return `${preference}:${systemTheme}`;
}

function getServerThemeSnapshot() {
  return SERVER_THEME_SNAPSHOT;
}

function subscribeToTheme(callback: () => void) {
  const handleThemeChange = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorage);

  let mediaQuery: MediaQueryList | undefined;

  if (typeof window.matchMedia === "function") {
    try {
      mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
      mediaQuery.addEventListener("change", handleThemeChange);
    } catch {
      mediaQuery = undefined;
    }
  }

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorage);
    mediaQuery?.removeEventListener("change", handleThemeChange);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToTheme,
    getBrowserThemeSnapshot,
    getServerThemeSnapshot,
  );
  const [preferenceValue, systemTheme] = snapshot.split(":");
  const preference = parseThemePreference(preferenceValue);
  const effectiveTheme = getEffectiveTheme(preference, systemTheme === "dark");

  useEffect(() => {
    applyThemeToRoot(document.documentElement, preference, effectiveTheme);
  }, [effectiveTheme, preference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    persistThemePreference(getBrowserStorage(), nextPreference);
    applyThemeToRoot(
      document.documentElement,
      nextPreference,
      getEffectiveTheme(nextPreference, getSystemPrefersDark()),
    );
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ effectiveTheme, preference, setPreference }),
    [effectiveTheme, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
