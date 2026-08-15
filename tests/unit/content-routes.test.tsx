import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import App from "../../app/root";
import Home, { loader as homeLoader } from "../../app/routes/home";
import Projects, { loader as projectsLoader } from "../../app/routes/projects";
import Writings, { loader as writingsLoader } from "../../app/routes/writings";

const ContentRoutes = createRoutesStub([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Home, loader: homeLoader },
      { path: "projects", Component: Projects, loader: projectsLoader },
      { path: "writings", Component: Writings, loader: writingsLoader },
    ],
  },
]);

function renderRoute(path: string) {
  return render(<ContentRoutes initialEntries={[path]} />);
}

describe("content routes", () => {
  it("obtains approved home data through the repository loader", async () => {
    const data = await homeLoader();

    expect(Object.keys(data).sort()).toEqual([
      "canonicalOrigin",
      "identity",
      "seo",
    ]);
    expect(data.identity.displayName).toBe("Rahul Yadav");
    expect(data.identity.professionalPositioning).toMatch(/backend/i);
    expect(data.seo.canonicalPath).toBe("/");
    expect(data.canonicalOrigin).toBe("https://rahuly.in");
    expect(data).not.toHaveProperty("contacts");
    expect(data).not.toHaveProperty("socialLinks");
    expect(data).not.toHaveProperty("experiences");
    expect(data).not.toHaveProperty("credibilityHighlights");
    expect(data).not.toHaveProperty("skillGroups");
    expect(data).not.toHaveProperty("education");
    expect(data).not.toHaveProperty("featuredProjects");
    expect(data).not.toHaveProperty("recentWritings");
    expect(data).not.toHaveProperty("resumeAsset");
  });

  it("obtains valid empty project and writing collections through loaders", async () => {
    await expect(projectsLoader()).resolves.toMatchObject({ items: [] });
    await expect(writingsLoader()).resolves.toMatchObject({ items: [] });
  });

  it.each([
    ["/", "Rahul Yadav"],
    ["/projects", "Projects"],
    ["/writings", "Writings"],
  ])("renders one page heading for %s", async (path, heading) => {
    renderRoute(path);

    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it.each([
    ["/projects", "No published projects are available yet."],
    ["/writings", "No published writings are available yet."],
  ])("renders an accessible empty state for %s", async (path, message) => {
    renderRoute(path);

    expect(await screen.findByText(message)).toBeVisible();
  });

  it("provides semantic navigation and a working skip link", async () => {
    const user = userEvent.setup();
    renderRoute("/");

    expect(
      await screen.findByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
    const main = screen.getByRole("main");
    const skipLink = screen.getByRole("link", { name: "Skip to content" });

    expect(main).toHaveAttribute("id", "main-content");
    expect(skipLink).toHaveAttribute("href", "#main-content");

    await user.click(skipLink);

    expect(main).toHaveFocus();
  });

  it("navigates between repository-backed collection pages", async () => {
    const user = userEvent.setup();
    renderRoute("/");
    await screen.findByRole("heading", { level: 1, name: "Rahul Yadav" });

    await user.click(screen.getByRole("link", { name: "Projects" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No published projects are available yet."),
    ).toBeVisible();
  });
});
