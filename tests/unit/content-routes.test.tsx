import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ExperienceSection } from "../../app/components/home/experience-section";
import App, { loader as rootLoader } from "../../app/root";
import Home, { loader as homeLoader } from "../../app/routes/home";
import ProjectDetail, {
  loader as projectDetailLoader,
} from "../../app/routes/project-detail";
import Projects, { loader as projectsLoader } from "../../app/routes/projects";
import Writings, { loader as writingsLoader } from "../../app/routes/writings";

const approvedAboutCopy =
  "I build backend systems with Python, FastAPI, Django/DRF, PostgreSQL, Redis, and AWS, focusing on API design and migration, authentication and authorization, caching, performance, and testing. For end-to-end delivery, I work with JavaScript, React, Redux, Vue.js, Nuxt.js, Quasar, and HTML/CSS to integrate interfaces with backend services and carry features from design through release. I also contribute to technical decisions, code reviews, and delivery across teams. I spent more than two years building and modernizing enterprise SaaS products at Gainfront and now contribute to an Airbus customer engagement at Sopra Steria.";

const ContentRoutes = createRoutesStub([
  {
    path: "/",
    Component: App,
    loader: rootLoader,
    children: [
      { index: true, Component: Home, loader: homeLoader },
      { path: "projects", Component: Projects, loader: projectsLoader },
      {
        path: "projects/:slug",
        Component: ProjectDetail,
        loader: projectDetailLoader,
      },
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
      "credibilityCards",
      "education",
      "experiences",
      "identity",
      "location",
      "portrait",
      "projects",
      "resume",
      "seo",
      "skillGroups",
      "socialLinks",
    ]);
    expect(data.identity.displayName).toBe("Rahul Yadav");
    expect(data.location).toBe("Bengaluru, Mumbai - India");
    expect(data.identity.professionalPositioning).toMatch(
      /Python backends.*React and Vue/i,
    );
    expect(data.identity.introduction).toBe(approvedAboutCopy);
    expect(data.seo.canonicalPath).toBe("/");
    expect(data.canonicalOrigin).toBe("https://rahuly.in");
    expect(data.experiences).toHaveLength(3);
    expect(data.skillGroups).toHaveLength(6);
    expect(data.education).toHaveLength(1);
    expect(data).not.toHaveProperty("featuredProjects");
    expect(data).not.toHaveProperty("recentWritings");
    expect(data).not.toHaveProperty("resumeAsset");
    expect(data).not.toHaveProperty("images");
    expect(JSON.stringify(data)).not.toContain("sourcePath");
    expect(JSON.stringify(data)).not.toContain("sha256");
    expect(JSON.stringify(data)).not.toContain("supportingClaimIds");
    expect(JSON.stringify(data)).not.toContain("claim-");
  });

  it("renders semantic professional sections, native disclosure, and resilient logo identity", async () => {
    renderRoute("/");

    expect(
      await screen.findByRole("heading", { level: 2, name: "Experience" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Skills" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Education" }),
    ).toBeVisible();
    expect(screen.getByText(approvedAboutCopy)).toBeVisible();

    const credibilityItems = document.querySelectorAll(
      ".credibility-list > .credibility-list__item",
    );
    expect(credibilityItems).toHaveLength(3);
    expect(credibilityItems[2]).toHaveClass("credibility-list__item--outcomes");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Phased application modernization",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Greenfield product delivery",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Leadership and measurable outcomes",
      }),
    ).toBeVisible();
    expect(
      document.querySelectorAll(".credibility-list__outcomes > li"),
    ).toHaveLength(3);

    for (const sectionId of [
      "about",
      "credibility",
      "experience",
      "projects",
      "skills",
      "education",
      "contact",
    ]) {
      const section = document.getElementById(sectionId);
      expect(section).not.toBeNull();
      const inner = section?.firstElementChild;
      expect(inner).toHaveClass("home-section__inner");
      expect(section?.children).toHaveLength(1);
      const headingBlock = inner?.children[0];
      const sectionContent = inner?.children[1];
      expect(headingBlock).toHaveClass("ui-section-heading");
      expect(sectionContent).toBeDefined();
      expect(inner?.firstElementChild).toBe(headingBlock);
      expect(headingBlock?.nextElementSibling).toBe(sectionContent);
    }
    expect(
      screen.getByRole("list", {
        name: "Professional experience in reverse chronological order",
      }).tagName,
    ).toBe("OL");
    const sopraHeading = screen.getByRole("heading", {
      level: 3,
      name: "Sopra Steria",
    });
    const sopraRole = screen.getByRole("heading", {
      level: 4,
      name: "Senior Software Engineer",
    });
    expect(sopraHeading).toBeVisible();
    expect(sopraRole).toBeVisible();
    expect(sopraHeading.parentElement).toHaveClass(
      "experience-entry__identity-copy",
    );
    expect(sopraRole.parentElement).toHaveClass("experience-role__title-row");
    expect(sopraHeading.nextElementSibling).toBe(sopraRole.parentElement);
    expect(
      sopraHeading.compareDocumentPosition(sopraRole) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(sopraHeading.closest(".experience-entry__header")).toContainElement(
      sopraRole,
    );
    const featuredIndicators = screen.getAllByRole("img", {
      name: "Featured experience",
    });
    expect(featuredIndicators).toHaveLength(2);
    for (const indicator of featuredIndicators) {
      expect(indicator).toHaveAttribute("tabindex", "0");
      expect(indicator.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(within(indicator).getByRole("tooltip")).toHaveTextContent(
        "Featured experience",
      );
    }
    const sopraFeatured = featuredIndicators[0];
    if (sopraFeatured === undefined) {
      throw new Error("Missing Sopra Steria featured indicator.");
    }
    expect(sopraRole.parentElement).toContainElement(sopraFeatured);
    const marsHeading = screen.getByRole("heading", {
      level: 3,
      name: "MarsDevs",
    });
    expect(
      marsHeading
        .closest(".experience-entry")
        ?.querySelector(".experience-entry__featured"),
    ).toBeNull();
    expect(
      document.querySelectorAll(".experience-role__dates time"),
    ).toHaveLength(3);
    expect(screen.getByText("Customer engagement:")).toBeVisible();
    expect(screen.getByText("Airbus")).toBeVisible();
    expect(
      screen.getByText("AWS ALB listener-rule URL rewrite transforms"),
    ).toHaveProperty("tagName", "STRONG");
    expect(screen.getByText("4 greenfield modules")).toHaveProperty(
      "tagName",
      "STRONG",
    );
    expect(screen.getByText("35%")).toHaveProperty("tagName", "STRONG");

    const disclosures = screen.getAllByRole("button", {
      name: /Show \d+ more contributions/,
    });
    expect(disclosures).toHaveLength(2);
    const firstDisclosure = disclosures[0];
    const firstDetails = firstDisclosure?.closest("details");
    expect(firstDetails).not.toBeNull();
    expect(firstDetails).not.toHaveAttribute("open");
    expect(firstDisclosure).toHaveTextContent("Show 3 more contributions");
    expect(firstDisclosure).toHaveAttribute("aria-expanded", "false");
    const controlledId = firstDisclosure?.getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();
    expect(document.getElementById(controlledId ?? "")).toHaveAttribute(
      "start",
      "4",
    );

    const skillItems = [
      ...document.querySelectorAll<HTMLLIElement>(
        ".skill-group > ul.skill-group__skills > li",
      ),
    ];
    expect(skillItems).toHaveLength(44);
    expect(new Set(skillItems.map((item) => item.textContent))).toHaveProperty(
      "size",
      44,
    );
    for (const group of document.querySelectorAll(".skill-group")) {
      expect(group.querySelector("ul.skill-group__skills")).not.toBeNull();
      expect(
        group.querySelector(".skill-group__icon")?.getAttribute("aria-hidden"),
      ).toBe("true");
    }
    expect(screen.queryByText("PHP", { exact: true })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Bachelor of Engineering in Computer Engineering",
      }),
    ).toBeVisible();
    expect(screen.getByText("University of Mumbai")).toBeVisible();
    expect(screen.getByText(/2016–2020/)).toHaveTextContent("CGPA 8.74/10");
    expect(screen.getByText("Bengaluru, Mumbai - India")).toBeVisible();

    const organizationImages = document.querySelectorAll<HTMLImageElement>(
      ".organization-logo img",
    );
    expect(organizationImages).toHaveLength(4);
    for (const image of organizationImages)
      expect(image).toHaveAttribute("alt", "");
    const sopraLogo = organizationImages[0];
    if (sopraLogo === undefined) throw new Error("Missing Sopra Steria logo.");
    fireEvent.error(sopraLogo);
    expect(
      screen.getByRole("heading", { level: 3, name: "Sopra Steria" }),
    ).toBeVisible();

    const contactLabels = [
      ...document.querySelectorAll(".contact-actions__row > dt"),
    ].map((label) => label.textContent);
    expect(contactLabels).toEqual(["Email", "Phone", "Profiles", "Location"]);
    expect(
      document.querySelector(".contact-actions__profile-row")?.textContent,
    ).toContain("Download resume");

    for (const platform of ["GitHub", "LinkedIn"]) {
      const link = screen.getByRole("link", {
        name: `${platform} (opens in a new tab)`,
      });
      expect(link).toHaveClass("contact-actions__social-link");
      expect(link.querySelector(".contact-actions__social-icon svg")).not.toBe(
        null,
      );
      expect(
        link.querySelector(".contact-actions__social-tooltip"),
      ).toHaveTextContent(platform);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    const footerMessage = document.querySelector(".site-footer__message");
    expect(footerMessage).toBeVisible();
    expect(footerMessage).toHaveTextContent(
      "Made with ❤️ in India · Thank you for visiting.",
    );
    expect(document.querySelector(".site-footer__identity")).toBeNull();
    expect(screen.getAllByRole("img", { name: "love" })).toHaveLength(2);
  });

  it("updates the contribution disclosure label through the pointer cycle", async () => {
    const data = await homeLoader();
    const user = userEvent.setup();
    render(<ExperienceSection experiences={data.experiences} />);

    const disclosure = screen.getByRole("button", {
      name: "Show 3 more contributions",
    });
    const details = disclosure.closest("details");
    const controlledId = disclosure.getAttribute("aria-controls");
    expect(details).not.toHaveAttribute("open");
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(controlledId ?? "")?.children).toHaveLength(
      3,
    );

    await user.click(disclosure);
    expect(details).toHaveAttribute("open");
    expect(disclosure).toHaveTextContent("Hide 3 more contributions");
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(disclosure).toHaveFocus();

    await user.click(disclosure);
    expect(details).not.toHaveAttribute("open");
    expect(disclosure).toHaveTextContent("Show 3 more contributions");
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
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

  it("obtains the four project plans and empty writing collection through loaders", async () => {
    await expect(projectsLoader()).resolves.toMatchObject({
      items: [
        { slug: "tourney" },
        { slug: "url-shortener" },
        { slug: "portfolio-tracker" },
        { slug: "universal-job-tracker" },
      ],
    });
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

  it.each([["/writings", "No published writings are available yet."]])(
    "renders an accessible empty state for %s",
    async (path, message) => {
      renderRoute(path);

      expect(await screen.findByText(message)).toBeVisible();
    },
  );

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
    expect(screen.getAllByText("View project plan")).toHaveLength(4);
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

  it("keeps inside pointer interactions open and closes outside touch-equivalent pointers with cleanup", async () => {
    const addListener = vi.spyOn(document, "addEventListener");
    const removeListener = vi.spyOn(document, "removeEventListener");
    const user = userEvent.setup();
    renderRoute("/");

    const menuButton = await screen.findByRole("button", {
      name: "Open navigation",
    });
    await user.click(menuButton);
    const closeButton = screen.getByRole("button", {
      name: "Close navigation",
    });
    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
    expect(addListener).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );

    fireEvent.pointerDown(primaryNavigation, { pointerType: "touch" });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(screen.getByRole("main"), { pointerType: "touch" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(removeListener).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
  });
});
