import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SYSTEM_THEME_QUERY,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "@rahulyadev/design-system/theme";

import { THEME_STORAGE_KEY } from "../../app/theme-config";

interface MatchMediaController {
  setMatches: (matches: boolean) => void;
}

function installMatchMedia(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: SYSTEM_THEME_QUERY,
    onchange: null,
    addEventListener(
      event: string,
      listener: (event: MediaQueryListEvent) => void,
    ) {
      if (event === "change") {
        listeners.add(listener);
      }
    },
    removeEventListener(
      event: string,
      listener: (event: MediaQueryListEvent) => void,
    ) {
      if (event === "change") {
        listeners.delete(listener);
      }
    },
  } as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => {
      expect(query).toBe(SYSTEM_THEME_QUERY);
      return mediaQuery;
    }),
  );

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      listeners.forEach((listener) => {
        listener(event);
      });
    },
  };
}

function EffectiveThemeProbe() {
  const { effectiveTheme, preference } = useTheme();

  return <output>{`${preference}:${effectiveTheme}`}</output>;
}

afterEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset["theme"];
  delete document.documentElement.dataset["themePreference"];
  document.documentElement.style.colorScheme = "";
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("exposes one checked accessible radio and persists pointer selection", async () => {
    installMatchMedia(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const user = userEvent.setup();

    render(
      <>
        <ThemeProvider storageKey={THEME_STORAGE_KEY}>
          <ThemeToggle />
        </ThemeProvider>
        <button type="button">Next control</button>
      </>,
    );

    const group = screen.getByRole("radiogroup", {
      name: "Theme preference",
    });
    const dark = await screen.findByRole("radio", { name: "Dark" });
    const light = screen.getByRole("radio", { name: "Light" });

    expect(group).toBeVisible();
    await waitFor(() => {
      expect(dark).toHaveAttribute("aria-checked", "true");
    });
    expect(dark).toHaveAttribute("tabindex", "0");
    expect(light).toHaveAttribute("tabindex", "-1");

    await user.click(light);

    expect(light).toHaveAttribute("aria-checked", "true");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    await user.click(screen.getByRole("button", { name: "Next control" }));

    expect(screen.getByRole("button", { name: "Next control" })).toHaveFocus();
    expect(light).toHaveAttribute("aria-checked", "true");
  });

  it("supports arrow, Home, and End keys with roving focus", async () => {
    installMatchMedia(false);
    const user = userEvent.setup();

    render(
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const system = await screen.findByRole("radio", { name: "System" });
    const light = screen.getByRole("radio", { name: "Light" });
    const dark = screen.getByRole("radio", { name: "Dark" });

    system.focus();
    await user.keyboard("{ArrowRight}");
    expect(light).toHaveFocus();
    expect(light).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{End}");
    expect(system).toHaveFocus();
    expect(system).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{Home}");
    expect(light).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(system).toHaveFocus();

    system.focus();
    await user.keyboard("{ArrowLeft}");
    expect(dark).toHaveFocus();
  });

  it("offers an icon-only presentation with accessible names and tooltips", async () => {
    installMatchMedia(false);

    render(
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <ThemeToggle aria-label="Compact theme" presentation="compact" />
      </ThemeProvider>,
    );

    const group = screen.getByRole("radiogroup", { name: "Compact theme" });
    expect(group).toHaveAttribute("data-presentation", "compact");

    for (const name of ["Light", "Dark", "System"]) {
      const radio = await screen.findByRole("radio", { name });
      const tooltipId = radio.getAttribute("aria-describedby");
      expect(tooltipId).toBeTruthy();
      expect(radio).not.toHaveAttribute("title");
      expect(document.getElementById(tooltipId ?? "")).toHaveAttribute(
        "role",
        "tooltip",
      );
      expect(document.getElementById(tooltipId ?? "")).toHaveTextContent(name);
    }
  });

  it("tracks operating-system theme changes while system mode is selected", async () => {
    const matchMedia = installMatchMedia(false);

    render(
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <EffectiveThemeProbe />
      </ThemeProvider>,
    );

    expect(await screen.findByText("system:light")).toBeVisible();

    act(() => {
      matchMedia.setMatches(true);
    });

    expect(await screen.findByText("system:dark")).toBeVisible();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
