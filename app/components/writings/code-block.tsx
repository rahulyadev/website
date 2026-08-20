import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { VisuallyHidden } from "@rahulyadev/design-system";

type CopyState = "idle" | "copied" | "failed";

const subscribeToHydration = () => () => undefined;

function CopyIcon({ copied }: { readonly copied: boolean }) {
  return copied ? (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12.5 4.25 4.25L19 7" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="11" rx="1.5" width="11" x="8" y="8" />
      <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
    </svg>
  );
}

export function CodeBlock({
  code,
  language,
}: {
  readonly code: string;
  readonly language?: string | undefined;
}) {
  const enhanced = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== undefined) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const resetLater = () => {
    if (resetTimer.current !== undefined) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setCopyState("idle");
      resetTimer.current = undefined;
    }, 2_000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    resetLater();
  };

  const status =
    copyState === "copied"
      ? "Copied"
      : copyState === "failed"
        ? "Copy failed"
        : "";

  return (
    <figure className="article-code">
      <figcaption className="article-code__header">
        <span>{language ?? "Code"}</span>
        {enhanced ? (
          <button
            aria-label={
              copyState === "copied"
                ? "Code copied"
                : copyState === "failed"
                  ? "Copy code again"
                  : "Copy code"
            }
            className="article-code__copy"
            data-copy-state={copyState}
            onClick={() => void copy()}
            type="button"
          >
            <CopyIcon copied={copyState === "copied"} />
            <VisuallyHidden>
              {copyState === "copied" ? "Copied" : "Copy code"}
            </VisuallyHidden>
          </button>
        ) : null}
        <VisuallyHidden aria-live="polite">{status}</VisuallyHidden>
      </figcaption>
      <pre tabIndex={0}>
        <code
          className={
            language === undefined ? undefined : `language-${language}`
          }
        >
          {code}
        </code>
      </pre>
    </figure>
  );
}
