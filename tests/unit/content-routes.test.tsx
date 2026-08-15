import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import App, { loader as rootLoader } from "../../app/root";
import Home, { loader as homeLoader } from "../../app/routes/home";
import Projects, { loader as projectsLoader } from "../../app/routes/projects";
import Writings, { loader as writingsLoader } from "../../app/routes/writings";

const ContentRoutes = createRoutesStub([
  {
    path: "/",
    Component: App,
    loader: rootLoader,
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
  it("obtains the minimal approved home projection through the repository loader", async () => {
    const data = await homeLoader();

    expect(Object.keys(data).sort()).toEqual([
      "canonicalOrigin",
      "contacts",
      "credibilityHighlights",
      "identity",
      "location",
      "portrait",
      "resume",
      "seo",
      "socialLinks",
    ]);
    expect(data.identity.displayName).toBe("Rahul Yadav");
    expect(data.location).toBe("Bangalore, Mumbai, India");
    expect(data.identity.professionalPositioning).toMatch(
      /Python backends.*React and Vue/i,
    );
    expect(data.seo.canonicalPath).toBe("/");
    expect(data.canonicalOrigin).toBe("https://rahuly.in");
    expect(data).not.toHaveProperty("experiences");
    expect(data).not.toHaveProperty("skillGroups");
    expect(data).not.toHaveProperty("education");
    expect(data).not.toHaveProperty("featuredProjects");
    expect(data).not.toHaveProperty("recentWritings");
    expect(data).not.toHaveProperty("resumeAsset");
    expect(data).not.toHaveProperty("images");
    expect(JSON.stringify(data)).not.toContain("sourcePath");
    expect(JSON.stringify(data)).not.toContain("sha256");
    expect(JSON.stringify(data)).not.toContain("supportingClaimIds");
  });

  it("obtains a smaller root shell projection for every route", async () => {
    const data = await rootLoader();

    expect(Object.keys(data).sort()).toEqual(["compactPortrait", "identity"]);
    expect(Object.keys(data.identity).sort()).toEqual([
      "displayName",
      "roleLabel",
    ]);
    expect(data.compactPortrait.altText).toBe("");
    expect(data.compactPortrait.variants).toHaveLength(6);
    expect(JSON.stringify(data)).not.toContain("introduction");
    expect(JSON.stringify(data)).not.toContain("sourcePath");
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

  it("keeps a real top fragment while enhancing focus and scroll without navigation", async () => {
    const user = userEvent.setup();
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    renderRoute("/");

    const backToTop = await screen.findByRole("link", {
      name: "Back to top",
    });
    const destination = document.getElementById("top");
    expect(destination).not.toBeNull();
    expect(backToTop).toHaveAttribute("href", "#top");

    await user.click(backToTop);

    expect(destination).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 0, top: 0 }),
    );
    expect(window.location.hash).toBe("");
    scrollTo.mockRestore();
  });

  it("navigates between repository-backed collection pages", async () => {
    const user = userEvent.setup();
    renderRoute("/");
    await screen.findByRole("heading", { level: 1, name: "Rahul Yadav" });

    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    await user.click(
      within(primaryNavigation).getByRole("link", { name: "Projects" }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No published projects are available yet."),
    ).toBeVisible();
  });

  it("marks the current primary navigation item and shows compact identity off home", async () => {
    renderRoute("/projects");

    const primaryNavigation = await screen.findByRole("navigation", {
      name: "Primary",
    });
    expect(
      within(primaryNavigation).getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Rahul Yadav/i })).toHaveAttribute(
      "data-visible",
      "true",
    );
  });

  it("closes the mobile navigation with Escape and restores menu-button focus", async () => {
    const user = userEvent.setup();
    renderRoute("/");

    const menuButton = await screen.findByRole("button", {
      name: "Open navigation",
    });
    await user.click(menuButton);
    expect(
      screen.getByRole("button", { name: "Close navigation" }),
    ).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(menuButton).toHaveFocus();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
