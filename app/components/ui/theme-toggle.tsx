import { useId, useRef, type KeyboardEvent } from "react";

import { THEME_PREFERENCES, useTheme, type ThemePreference } from "../../theme";

const labels: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
      </svg>
    );
  }

  if (preference === "dark") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="13" rx="1.5" width="19" x="2.5" y="3.5" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </svg>
  );
}

export interface ThemeToggleProps {
  "aria-label"?: string;
  className?: string;
  presentation?: "compact" | "full";
}

export function ThemeToggle({
  "aria-label": ariaLabel = "Theme preference",
  className,
  presentation = "full",
}: ThemeToggleProps) {
  const { preference, setPreference } = useTheme();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tooltipIdPrefix = useId();

  const selectAndFocus = (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    const nextIndex = THEME_PREFERENCES.indexOf(nextPreference);
    optionRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % THEME_PREFERENCES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + THEME_PREFERENCES.length) %
        THEME_PREFERENCES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = THEME_PREFERENCES.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      const nextPreference = THEME_PREFERENCES[nextIndex];

      if (nextPreference) {
        selectAndFocus(nextPreference);
      }
    }
  };

  return (
    <div
      aria-label={ariaLabel}
      className={["ui-theme-toggle", className].filter(Boolean).join(" ")}
      data-presentation={presentation}
      role="radiogroup"
    >
      {THEME_PREFERENCES.map((option, index) => {
        const selected = preference === option;
        const tooltipId = `${tooltipIdPrefix}-${option}-theme-tooltip`;

        return (
          <button
            aria-checked={selected}
            aria-describedby={
              presentation === "compact" ? tooltipId : undefined
            }
            aria-label={labels[option]}
            className="ui-theme-toggle__option"
            key={option}
            onClick={() => {
              setPreference(option);
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index);
            }}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            role="radio"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            <ThemeIcon preference={option} />
            <span className="ui-theme-toggle__label">{labels[option]}</span>
            {presentation === "compact" ? (
              <span
                className="ui-theme-toggle__tooltip"
                id={tooltipId}
                role="tooltip"
              >
                {labels[option]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
