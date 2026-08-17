import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CodeBlock } from "../../app/components/writings/code-block";
import { loadWritingDetailPageData } from "../../app/content/writings-route-data.server";
import WritingDetail, {
  loader as writingDetailLoader,
} from "../../app/routes/writing-detail";
import Writings, { loader as writingsLoader } from "../../app/routes/writings";

const slugs = [
  "async-document-processing-retries-dlq",
  "database-backed-pytest-fixtures",
  "jwt-revocation-rate-limiting-redis",
  "phased-application-modernization",
  "reducing-api-payloads",
] as const;

const publicationDates = [
  "2026-08-17",
  "2026-08-10",
  "2026-08-03",
  "2026-07-27",
  "2026-07-20",
] as const;

const WritingRoutes = createRoutesStub([
  { path: "/writings", Component: Writings, loader: writingsLoader },
  {
    path: "/writings/:slug",
    Component: WritingDetail,
    loader: writingDetailLoader,
  },
]);

function renderWritingRoute(path: string) {
  return render(<WritingRoutes initialEntries={[path]} />);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("writing routes", () => {
  it("renders the approved editorial index in deterministic order", async () => {
    const { container } = renderWritingRoute("/writings");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Writings" }),
    ).toBeVisible();
    expect(screen.getByText("ENGINEERING NOTES")).toBeVisible();
    expect(
      screen.getByText(
        "Notes on backend systems, application modernization, testing, and the engineering decisions behind maintainable software.",
      ),
    ).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelectorAll(".writing-row")).toHaveLength(5);
    expect(
      screen
        .getAllByRole("link", { name: /.+/ })
        .filter((link) => link.getAttribute("href")?.startsWith("/writings/"))
        .map((link) => link.getAttribute("href")),
    ).toEqual(slugs.map((slug) => `/writings/${slug}`));
    expect(container.querySelectorAll(".writing-row time")).toHaveLength(5);
    expect(
      [...container.querySelectorAll(".writing-row")].map((row) => {
        const body = row.querySelector(":scope > .writing-row__body");
        const date = body?.querySelector(":scope > time:first-child");
        return {
          date: date?.getAttribute("datetime"),
          nextElement: date?.nextElementSibling?.tagName,
          sameColumn: body === date?.parentElement,
        };
      }),
    ).toEqual(
      publicationDates.map((date) => ({
        date,
        nextElement: "H2",
        sameColumn: true,
      })),
    );
    expect(screen.queryByText(/No writing has been approved/)).toBeNull();
  });

  it("keeps the approved empty state available without placeholder articles", async () => {
    const EmptyRoute = createRoutesStub([
      {
        path: "/writings",
        Component: Writings,
        loader: () => ({
          canonicalOrigin: "https://rahuly.in",
          seo: {
            title: "Writings | Rahul Yadav",
            description: "Engineering notes.",
            canonicalPath: "/writings" as const,
          },
          items: [],
        }),
      },
    ]);
    render(<EmptyRoute initialEntries={["/writings"]} />);

    expect(
      await screen.findByText(
        "No writing has been approved for publication yet. The first article will appear here after editorial and confidentiality review.",
      ),
    ).toBeVisible();
  });

  it("renders article semantics, generated contents, code, tables, and navigation", async () => {
    const { container } = renderWritingRoute(
      "/writings/phased-application-modernization",
    );
    const heading = await screen.findByRole("heading", {
      level: 1,
      name: "Phased Application Modernization Without a Big-Bang Cutover",
    });

    expect(heading).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    const breadcrumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(
      within(breadcrumbs).getByRole("link", { name: "Home" }),
    ).toHaveAttribute("href", "/");
    expect(
      within(breadcrumbs).getByRole("link", { name: "Writings" }),
    ).toHaveAttribute("href", "/writings");
    const toc = screen
      .getByText("On this page", {
        exact: true,
        selector: "summary span",
      })
      .closest("details");
    expect(toc).not.toHaveAttribute("open");
    expect(toc?.querySelector("summary")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      container.querySelectorAll(".article-prose h2[id]").length,
    ).toBeGreaterThan(3);
    expect(container.querySelector("pre code.language-text")).toHaveTextContent(
      "send request to new-api",
    );
    expect(
      screen.getByRole("region", { name: /Table: Concern/ }),
    ).toContainElement(screen.getByRole("table"));
    expect(
      screen.getByRole("navigation", { name: "More writings" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Back to writings" }),
    ).toHaveAttribute("href", "/writings");
  });

  it("enhances the native contents disclosure with scoped dismissal and focus", async () => {
    const user = userEvent.setup();
    renderWritingRoute("/writings/phased-application-modernization");

    const summaryLabel = await screen.findByText("On this page", {
      exact: true,
      selector: "summary span",
    });
    const summary = summaryLabel.closest("summary");
    const details = summaryLabel.closest("details");
    if (summary === null || details === null) {
      throw new Error("Expected native contents disclosure.");
    }

    await user.click(summary);
    await waitFor(() => {
      expect(summary).toHaveAttribute("aria-expanded", "true");
    });
    const firstLink = screen.getByRole("link", {
      name: "Start with a migration boundary, not a framework",
    });
    fireEvent.pointerDown(firstLink);
    expect(details).toHaveAttribute("open");

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(details).not.toHaveAttribute("open");
    });

    await user.click(summary);
    await waitFor(() => {
      expect(summary).toHaveAttribute("aria-expanded", "true");
    });
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(details).not.toHaveAttribute("open");
      expect(summary).toHaveFocus();
    });

    await user.click(summary);
    await user.click(firstLink);
    const target = document.getElementById(
      "start-with-a-migration-boundary-not-a-framework",
    );
    await waitFor(() => {
      expect(details).not.toHaveAttribute("open");
      expect(target).toHaveFocus();
    });
  });

  it("keeps document disclosure listeners scoped to the open state", async () => {
    const addListener = vi.spyOn(document, "addEventListener");
    const removeListener = vi.spyOn(document, "removeEventListener");
    const user = userEvent.setup();
    renderWritingRoute("/writings/phased-application-modernization");

    const summary = (
      await screen.findByText("On this page", {
        exact: true,
        selector: "summary span",
      })
    ).closest("summary");
    if (summary === null) throw new Error("Expected disclosure summary.");

    expect(
      addListener.mock.calls.some(([type]) => type === "pointerdown"),
    ).toBe(false);
    await user.click(summary);
    await waitFor(() => {
      expect(
        addListener.mock.calls.some(([type]) => type === "pointerdown"),
      ).toBe(true);
      expect(addListener.mock.calls.some(([type]) => type === "keydown")).toBe(
        true,
      );
    });

    const pointerHandler = addListener.mock.calls.find(
      ([type]) => type === "pointerdown",
    )?.[1];
    const keyboardHandler = addListener.mock.calls.find(
      ([type]) => type === "keydown",
    )?.[1];
    await user.click(summary);
    await waitFor(() => {
      expect(removeListener).toHaveBeenCalledWith(
        "pointerdown",
        pointerHandler,
      );
      expect(removeListener).toHaveBeenCalledWith("keydown", keyboardHandler);
    });
  });

  it("omits the contents disclosure below the established heading threshold", async () => {
    const lookup = await loadWritingDetailPageData(
      "phased-application-modernization",
    );
    if (lookup.kind === "not-found") throw new Error("Expected writing.");

    const BelowThresholdRoute = createRoutesStub([
      {
        path: "/writings/:slug",
        Component: WritingDetail,
        loader: () => ({
          ...lookup,
          data: {
            ...lookup.data,
            writing: {
              ...lookup.data.writing,
              article: {
                ...lookup.data.writing.article,
                tableOfContents:
                  lookup.data.writing.article.tableOfContents.slice(0, 2),
              },
            },
          },
        }),
      },
    ]);
    render(
      <BelowThresholdRoute
        initialEntries={["/writings/phased-application-modernization"]}
      />,
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Phased Application Modernization Without a Big-Bang Cutover",
      }),
    ).toBeVisible();
    expect(document.querySelector("details.article-toc")).toBeNull();
  });

  it("enhances code with stable copy feedback after hydration", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    renderWritingRoute("/writings/phased-application-modernization");

    const copyButton = await screen.findByRole("button", { name: "Copy code" });
    await user.click(copyButton);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("send request to new-api"),
    );
    expect(copyButton).toHaveAttribute("aria-label", "Code copied");
    expect(copyButton).toHaveAttribute("data-copy-state", "copied");
    expect(
      screen.getAllByText("Copied", { selector: ".ui-visually-hidden" }),
    ).toHaveLength(2);
  });

  it("announces clipboard failure without claiming success", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("Clipboard unavailable"),
    );
    render(<CodeBlock code="value\n" language="text" />);

    const copyButton = await screen.findByRole("button", { name: "Copy code" });
    await user.click(copyButton);
    expect(copyButton).toHaveAttribute("aria-label", "Copy code again");
    expect(copyButton).toHaveAttribute("data-copy-state", "failed");
    expect(
      screen.getByText("Copy failed", { selector: "[aria-live='polite']" }),
    ).toBeInTheDocument();
  });

  it("renders escaped readable code and no copy control without JavaScript", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code={'<script>alert("x")</script>\n'} language="html" />,
    );

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<button");
    expect(html).toContain('class="language-html"');
  });

  it("uses the established accessible not-found view for an unknown slug", async () => {
    renderWritingRoute("/writings/not-an-article");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
