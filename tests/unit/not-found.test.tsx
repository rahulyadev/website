import { render, screen } from "@testing-library/react";
import { createRoutesStub, MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { NotFoundPage } from "../../app/components/not-found-page";
import App, { loader as rootLoader } from "../../app/root";
import NotFound from "../../app/routes/not-found";

const NotFoundRoutes = createRoutesStub([
  {
    path: "/",
    Component: App,
    loader: rootLoader,
    children: [{ path: "*", Component: NotFound }],
  },
]);

describe("not-found experience", () => {
  it("explains the missing page and provides safe navigation", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The requested page is not available."),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders through the catch-all route", async () => {
    render(<NotFoundRoutes initialEntries={["/missing-page"]} />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Page not found",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeVisible();
  });
});
