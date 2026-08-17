import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import ProjectDetail, {
  loader as projectDetailLoader,
} from "../../app/routes/project-detail";
import Projects, { loader as projectsLoader } from "../../app/routes/projects";

const ProjectRoutes = createRoutesStub([
  { path: "/projects", Component: Projects, loader: projectsLoader },
  {
    path: "/projects/:slug",
    Component: ProjectDetail,
    loader: projectDetailLoader,
  },
]);

function renderProjectRoute(path: string) {
  return render(<ProjectRoutes initialEntries={[path]} />);
}

const projects = [
  ["tourney", "Tourney", "tourney.rahuly.in"],
  ["url-shortener", "URL Shortener", "go.rahuly.in"],
  ["portfolio-tracker", "Portfolio Tracker", "invest.rahuly.in"],
  ["universal-job-tracker", "Universal Job Tracker", "jobs.rahuly.in"],
] as const;

describe("project routes", () => {
  it("renders the four-card roadmap with valid internal detail links", async () => {
    const { container } = renderProjectRoute("/projects");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Projects" }),
    ).toBeVisible();
    expect(container.querySelectorAll(".project-card")).toHaveLength(4);
    expect(screen.getAllByText("WIP")).toHaveLength(4);
    expect(
      screen
        .getAllByRole("link", { name: /View project plan for/ })
        .map((link) => link.getAttribute("href")),
    ).toEqual(projects.map(([slug]) => `/projects/${slug}`));

    for (const [, name, destination] of projects) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeVisible();
      expect(screen.getByText(destination).closest("a")).toBeNull();
    }
  });

  it.each(projects)(
    "renders the %s plan with truthful WIP navigation",
    async (slug, name, destination) => {
      const { container } = renderProjectRoute(`/projects/${slug}`);

      expect(
        await screen.findByRole("heading", { level: 1, name }),
      ).toBeVisible();
      expect(document.querySelectorAll("h1")).toHaveLength(1);
      expect(screen.getByText(destination).closest("a")).toBeNull();
      expect(
        screen.getByText(
          "Work in progress — development has not started yet. This page describes the intended direction, not shipped functionality.",
        ),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "What I plan to build",
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", { level: 2, name: "Planned stack" }),
      ).toBeVisible();
      const breadcrumbs = screen.getByRole("navigation", {
        name: "Breadcrumb",
      });
      expect(
        within(breadcrumbs).getByRole("link", { name: "Home" }),
      ).toHaveAttribute("href", "/");
      expect(
        within(breadcrumbs).getByRole("link", { name: "Projects" }),
      ).toHaveAttribute("href", "/projects");
      expect(container.querySelector(".project-mark svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(
        screen.getByRole("navigation", { name: "Project plans" }),
      ).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Back to all projects" }),
      ).toHaveAttribute("href", "/projects");
      expect(
        screen.queryByRole("link", {
          name: /^(?:Live|Demo|Source|Visit|Open app)$/i,
        }),
      ).toBeNull();
    },
  );

  it("renders the established accessible not-found view for an unknown slug", async () => {
    renderProjectRoute("/projects/not-a-project");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("exposes the URL Shortener heart with an accessible meaning", async () => {
    renderProjectRoute("/projects/url-shortener");

    await screen.findByRole("heading", {
      level: 1,
      name: "URL Shortener",
    });
    expect(screen.getByRole("img", { name: "love" })).toHaveTextContent("❤️");
  });
});
