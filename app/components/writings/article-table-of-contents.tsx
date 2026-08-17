import { useEffect, useRef, useState } from "react";

import type { ArticleTableOfContentsItem } from "../../domain/content";

function DisclosureChevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m7 9 5 5 5-5" />
    </svg>
  );
}

export function ArticleTableOfContents({
  items,
}: {
  readonly items: readonly ArticleTableOfContentsItem[];
}) {
  const [open, setOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const header = document.querySelector(".site-header");
    if (!(header instanceof HTMLElement)) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${String(Math.ceil(header.getBoundingClientRect().height))}px`,
      );
    };

    updateHeaderHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeaderHeight);
      return () => {
        window.removeEventListener("resize", updateHeaderHeight);
        document.documentElement.style.removeProperty("--site-header-height");
      };
    }

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const close = () => {
      if (detailsRef.current !== null) detailsRef.current.open = false;
      setOpen(false);
    };
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !detailsRef.current?.contains(target)) {
        close();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      summaryRef.current?.focus();
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectHeading = (headingId: string) => {
    if (detailsRef.current !== null) detailsRef.current.open = false;
    setOpen(false);
    window.requestAnimationFrame(() => {
      document.getElementById(headingId)?.focus({ preventScroll: true });
    });
  };

  return (
    <details
      className="article-toc"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !event.currentTarget.open) return;
        event.preventDefault();
        event.currentTarget.open = false;
        setOpen(false);
        summaryRef.current?.focus();
      }}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
      ref={detailsRef}
    >
      <summary aria-expanded={open} ref={summaryRef}>
        <span>On this page</span>
        <DisclosureChevron />
      </summary>
      <nav aria-label="On this page">
        <ol>
          {items.map((heading) => (
            <li data-level={heading.level} key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={() => {
                  selectHeading(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
