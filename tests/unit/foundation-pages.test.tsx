import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import App from "../../app/root";
import Home from "../../app/routes/home";
import Projects from "../../app/routes/projects";
import Writings from "../../app/routes/writings";

const FoundationRoutes = createRoutesStub([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Home },
      { path: "projects", Component: Projects },
      { path: "writings", Component: Writings },
    ],
  },
]);

function renderRoute(path: string) {
  return render(<FoundationRoutes initialEntries={[path]} />);
}

describe("foundation routes", () => {
  it.each([
    ["/", "Portfolio foundation"],
    ["/projects", "Projects"],
    ["/writings", "Writings"],
  ])("renders one page heading for %s", (path, heading) => {
    renderRoute(path);

    expect(
      screen.getByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it("provides semantic navigation and a working skip link", async () => {
    const user = userEvent.setup();
    renderRoute("/");

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeVisible();
    const main = screen.getByRole("main");
    const skipLink = screen.getByRole("link", { name: "Skip to content" });

    expect(main).toHaveAttribute("id", "main-content");
    expect(skipLink).toHaveAttribute("href", "#main-content");

    await user.click(skipLink);

    expect(main).toHaveFocus();
  });

  it("navigates between foundation pages", async () => {
    const user = userEvent.setup();
    renderRoute("/");

    await user.click(screen.getByRole("link", { name: "Projects" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not part of this foundation milestone/i),
    ).toBeVisible();
  });
});
