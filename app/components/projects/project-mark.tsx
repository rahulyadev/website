import type { ReactNode } from "react";

import type { ProjectMarkId } from "../../domain/content";

function markPaths(mark: ProjectMarkId): ReactNode {
  switch (mark) {
    case "tourney":
      return (
        <>
          <path d="M4 5h4v4h3M4 19h4v-4h3M20 5h-4v4h-3M20 19h-4v-4h-3" />
          <path d="M9 9h6v2.5a3 3 0 0 1-6 0V9Z" />
          <path d="M9 10H7.5v1a2 2 0 0 0 2 2M15 10h1.5v1a2 2 0 0 1-2 2M12 14.5V17M9.5 19h5M10 17h4" />
        </>
      );
    case "url-shortener":
      return (
        <>
          <path d="m9.25 14.75-1.5 1.5a3.18 3.18 0 0 1-4.5-4.5l3-3a3.18 3.18 0 0 1 4.5 0" />
          <path d="m14.75 9.25 1.5-1.5a3.18 3.18 0 0 1 4.5 4.5l-3 3a3.18 3.18 0 0 1-4.5 0" />
          <path d="m8.5 15.5 7-7M7 12h3M17 12h-3" />
          <path d="m9 10 1 2-1 2M15 10l-1 2 1 2" />
        </>
      );
    case "portfolio-tracker":
      return (
        <>
          <rect height="16" rx="2" width="18" x="3" y="4" />
          <path d="M7 16V9M7 16h11" />
          <path d="m8.5 14 3-3 2.5 1.5 3.5-4" />
          <path d="M15.5 8.5h2v2" />
        </>
      );
    case "universal-job-tracker":
      return (
        <>
          <path d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6" />
          <rect height="15" rx="2" width="20" x="2" y="6" />
          <path d="M2 11h20M8 11v10M14 11v3" />
          <path d="m15.5 17.5 1.5 1.5 3-3" />
        </>
      );
  }
}

export function ProjectMark({ mark }: { readonly mark: ProjectMarkId }) {
  return (
    <span className="project-mark" data-mark={mark}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        {markPaths(mark)}
      </svg>
    </span>
  );
}
