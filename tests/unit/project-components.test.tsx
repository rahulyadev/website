import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ProjectCard } from "../../app/components/projects/project-card";
import { ProjectMark } from "../../app/components/projects/project-mark";
import { ProjectStatusBadge } from "../../app/components/projects/project-status-badge";
import type { ProjectMarkId } from "../../app/domain/content";

const marks: readonly ProjectMarkId[] = [
  "tourney",
  "url-shortener",
  "portfolio-tracker",
  "universal-job-tracker",
];

describe("project presentation components", () => {
  it("renders all four marks as decorative, consistently sized inline SVGs", () => {
    const { container } = render(
      <div>
        {marks.map((mark) => (
          <div key={mark}>
            <span>{mark}</span>
            <ProjectMark mark={mark} />
          </div>
        ))}
      </div>,
    );

    const svgs = container.querySelectorAll(".project-mark > svg");
    expect(svgs).toHaveLength(4);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
    }
    for (const mark of marks) {
      expect(screen.getAllByText(mark)).toHaveLength(1);
    }
  });

  it("prepares accessible WIP, Beta, and Live status variants", () => {
    render(
      <div>
        <ProjectStatusBadge status="wip" />
        <ProjectStatusBadge status="beta" />
        <ProjectStatusBadge status="live" />
      </div>,
    );

    expect(screen.getByText("WIP")).toHaveAttribute("data-status", "wip");
    expect(screen.getByText("Beta")).toHaveAttribute("data-status", "beta");
    expect(screen.getByText("Live")).toHaveAttribute("data-status", "live");
  });

  it("gives the URL Shortener heart meaning without duplicating the project name", () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectCard
          project={{
            slug: "url-shortener",
            name: "URL Shortener",
            summary: "A planned invitation. ❤️",
            status: "wip",
            plannedDestination: "go.rahuly.in",
            plannedStack: ["FastAPI"],
            projectMark: "url-shortener",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: "love" })).toHaveTextContent("❤️");
    expect(screen.getAllByText("URL Shortener")).toHaveLength(1);
    expect(container.querySelector(".project-mark svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
