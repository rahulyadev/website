import { describe, expect, it } from "vitest";

import {
  loadHomePageData,
  loadProjectDetailPageData,
  loadProjectsPageData,
  loadSiteShellData,
} from "../../app/content/portfolio-route-data.server";
import { professionalContent } from "../../app/content/public/professional-content.server";

function expectExactKeys(value: object, keys: readonly string[]) {
  expect(Object.keys(value).sort()).toEqual([...keys].sort());
}

describe("portfolio route-data projections", () => {
  it("keeps the root shell payload to identity and compact portrait fields", async () => {
    const data = await loadSiteShellData();

    expectExactKeys(data, ["identity", "compactPortrait"]);
    expectExactKeys(data.identity, ["displayName", "roleLabel"]);
    expectExactKeys(data.compactPortrait, ["altText", "variants"]);
    expect(data.compactPortrait.altText).toBe("");
    expect(data.compactPortrait.variants).toHaveLength(6);
    for (const variant of data.compactPortrait.variants) {
      expectExactKeys(variant, ["height", "mediaType", "path", "width"]);
      expect(variant.height).toBe((variant.width * 5) / 4);
    }

    expect(JSON.stringify(data)).not.toMatch(
      /approvedOn|byteSize|metadataRemovalVerified|sha256|sourcePath/,
    );
  });

  it("returns the exact render-only home fields needed through Milestone 7", async () => {
    const data = await loadHomePageData();

    expectExactKeys(data, [
      "canonicalOrigin",
      "seo",
      "identity",
      "location",
      "credibilityCards",
      "experiences",
      "projects",
      "skillGroups",
      "education",
      "contacts",
      "socialLinks",
      "resume",
      "portrait",
    ]);
    expectExactKeys(data.identity, [
      "displayName",
      "roleLabel",
      "professionalPositioning",
      "introduction",
      "opportunityStatement",
    ]);
    expectExactKeys(data.resume, ["downloadName", "path", "title"]);
    expect(data.location).toBe("Bengaluru, Mumbai - India");
    expect(data.contacts.map((contact) => contact.kind).sort()).toEqual([
      "email",
      "phone",
    ]);
    expect(data.socialLinks.map((link) => link.platform).sort()).toEqual([
      "github",
      "linkedin",
    ]);
    expect(data.portrait.altText).not.toBe("");
    expect(data.portrait.variants).toHaveLength(9);
    expect(data.credibilityCards).toEqual([
      {
        title: "Phased application modernization",
        body: "Co-designed a PHP-to-FastAPI/React modernization for the Airbus engagement at Sopra Steria, using Strangler Fig routing and AWS ALB URL rewrites to avoid a big-bang cutover.",
      },
      {
        title: "Greenfield product delivery",
        body: "Delivered four greenfield modules at Gainfront—Request for Price, Target Report, Spend Analytics, and Itemized Quote—from requirements through release using Django REST Framework and Vue/Quasar.",
      },
      {
        title: "Leadership and measurable outcomes",
        outcomes: [
          {
            label: "Delivery leadership",
            detail:
              "Led delivery for three engineers and reviewed PRs across Sopra Steria, Airbus, and partner teams, while strengthening persistence and authorization testing with database-backed pytest fixtures.",
          },
          {
            label: "Payload efficiency",
            detail:
              "Reduced primary data-grid API payloads from approximately 1.5–2 MB to below 1 MB through response shaping and Gzip compression, meeting the ALB-to-Lambda response limit.",
          },
          {
            label: "Test coverage",
            detail:
              "At Gainfront, helped raise backend test coverage by approximately 45 percentage points, from approximately 40% to 85%, while strengthening CI and linting checks.",
          },
        ],
      },
    ]);

    expect(
      data.experiences.map((experience) => experience.organization),
    ).toEqual(["Sopra Steria", "Gainfront", "MarsDevs"]);
    expect(data.experiences.map((experience) => experience.featured)).toEqual([
      true,
      true,
      false,
    ]);
    for (const experience of data.experiences) {
      expectExactKeys(experience, [
        "organization",
        "featured",
        "logo",
        "roles",
      ]);
      expectExactKeys(experience.logo, ["path", "width", "height", "altText"]);
      expect(experience.logo.altText).toBe("");
      expect(experience.logo.width).toBe(200);
      expect(experience.logo.height).toBe(200);
    }
    const roles = data.experiences.map((experience) => experience.roles[0]);
    expect(roles.map((role) => role?.dateRange)).toEqual([
      "Aug 2025–Present",
      "Jun 2023–Aug 2025",
      "Nov 2020–Jun 2023",
    ]);
    expect(roles.map((role) => role?.location)).toEqual([
      "Bengaluru, India",
      "Bengaluru, India",
      "Pune, India",
    ]);
    expect(roles[0]?.engagement).toEqual({
      label: "Customer engagement",
      organization: "Airbus",
    });
    expect(roles[1]?.engagement).toBeUndefined();
    expect(roles[2]?.engagement).toBeUndefined();
    expect(roles.map((role) => role?.contributions.length)).toEqual([6, 5, 3]);
    expect(data.projects.map((project) => project.slug)).toEqual([
      "tourney",
      "url-shortener",
      "portfolio-tracker",
      "universal-job-tracker",
    ]);
    expect(data.projects.map((project) => project.plannedStack)).toEqual([
      ["FastAPI", "React", "PostgreSQL", "Redis"],
      ["FastAPI", "React", "PostgreSQL", "Redis"],
      ["Django REST Framework", "React", "PostgreSQL", "RabbitMQ"],
      ["FastAPI", "Vue.js", "PostgreSQL", "Pydantic"],
    ]);
    for (const project of data.projects) {
      expectExactKeys(project, [
        "slug",
        "name",
        "summary",
        "status",
        "plannedDestination",
        "plannedStack",
        "projectMark",
      ]);
      expect(project.status).toBe("wip");
    }
    const sourceContributions = professionalContent.experiences.map(
      (experience) =>
        experience.roles.map((role) =>
          role.responsibilities.map((responsibility) => responsibility.text),
        ),
    );
    const projectedContributions = data.experiences.map((experience) =>
      experience.roles.map((role) =>
        role.contributions.map((contribution) =>
          contribution.map((segment) => segment.text).join(""),
        ),
      ),
    );
    expect(projectedContributions).toEqual(sourceContributions);
    for (const contribution of data.experiences.flatMap((experience) =>
      experience.roles.flatMap((role) => role.contributions),
    )) {
      expect(contribution.some((segment) => segment.emphasized)).toBe(true);
      for (const segment of contribution) {
        expectExactKeys(segment, ["emphasized", "text"]);
      }
    }
    expect(
      data.experiences.flatMap((experience) =>
        experience.roles.flatMap((role) =>
          role.contributions.flatMap((contribution) =>
            contribution
              .filter((segment) => segment.emphasized)
              .map((segment) => segment.text),
          ),
        ),
      ),
    ).toEqual([
      "Strangler Fig pattern",
      "AWS ALB listener-rule URL rewrite transforms",
      "identity, authorization, and configuration state",
      "FastAPI and React",
      "PHP to FastAPI/React",
      "multi-select React component",
      "2 cross-cutting platform capabilities",
      "User Impersonation and Audit Logging",
      "~1.5-2 MB to <1 MB",
      "Gzip compression",
      "3 engineers",
      "reviewed PRs across Sopra, Airbus, and partner teams",
      "5 supplier-facing modules",
      "decoupled DRF APIs and a Vue.js/Quasar SPA",
      "4 greenfield modules",
      "RabbitMQ-based asynchronous document-processing prototype",
      "JWT authentication with Redis-backed token revocation and API rate limiting",
      "~45 percentage points (~40% to ~85%)",
      "pytest",
      "Polestar",
      "60%",
      "Python/Flask processing and GCP task orchestration",
      "Google Cloud Document AI",
      "35%",
    ]);

    expect(data.skillGroups.map((group) => group.name)).toEqual([
      "Languages",
      "Backend and APIs",
      "Frontend",
      "Databases, caching, and asynchronous processing",
      "Cloud and infrastructure",
      "Testing, quality, and developer tooling",
    ]);
    const skills = data.skillGroups.flatMap((group) => group.skills);
    expect(skills).toHaveLength(44);
    expect(new Set(skills)).toHaveProperty("size", 44);
    expect(skills).not.toContain("PHP");
    for (const group of data.skillGroups) {
      expectExactKeys(group, ["category", "name", "skills"]);
    }

    expect(data.education).toEqual([
      {
        institution: "University of Mumbai",
        credential: "Bachelor of Engineering",
        fieldOfStudy: "Computer Engineering",
        dateRange: "2016–2020",
        score: "CGPA 8.74/10",
        logo: {
          path: "/assets/organizations/university-of-mumbai.jpeg",
          width: 200,
          height: 200,
          altText: "",
        },
      },
    ]);

    const serialized = JSON.stringify(data);
    expect(serialized).not.toMatch(
      /approvedOn|assetId|byteSize|intakeSha256|linkCount|linkValidationVerified|metadataInspection|metadataRemovalVerified|originalFilename|pageCount|publicDerivativeSha256|sha256|sourcePath/,
    );
    expect(serialized).not.toMatch(/"(?:id|order|technologyIds)":/);
    expect(serialized).not.toMatch(
      /credibilityHighlights|featuredProjects|recentWritings|supportingClaimIds/,
    );
    expect(serialized).not.toContain("claim-");
  });

  it("keeps project index and detail payloads view-specific", async () => {
    const index = await loadProjectsPageData();
    const detail = await loadProjectDetailPageData("portfolio-tracker");

    expectExactKeys(index, ["canonicalOrigin", "seo", "items"]);
    expect(index.items).toHaveLength(4);
    for (const project of index.items) {
      expectExactKeys(project, [
        "slug",
        "name",
        "summary",
        "status",
        "plannedDestination",
        "plannedStack",
        "projectMark",
      ]);
    }

    expect(detail.kind).toBe("found");
    if (detail.kind !== "found") {
      throw new Error("Expected Portfolio Tracker detail data.");
    }
    expectExactKeys(detail.data, [
      "canonicalOrigin",
      "project",
      "previousProject",
      "nextProject",
    ]);
    expectExactKeys(detail.data.project, [
      "slug",
      "name",
      "summary",
      "status",
      "plannedDestination",
      "plannedCapabilities",
      "plannedStack",
      "stackRationale",
      "laterPossibilities",
      "disclaimer",
      "projectMark",
      "seo",
    ]);
    expect(detail.data.project.name).toBe("Portfolio Tracker");
    expect(detail.data.previousProject).toEqual({
      name: "URL Shortener",
      path: "/projects/url-shortener",
    });
    expect(detail.data.nextProject).toEqual({
      name: "Universal Job Tracker",
      path: "/projects/universal-job-tracker",
    });

    const serialized = JSON.stringify({ index, detail });
    expect(serialized).not.toMatch(
      /approvedOn|byteSize|featuredOnHome|homeStack|metadataRemovalVerified|publicationStatus|sha256|sourcePath|supportingClaimIds/,
    );
    expect(serialized).not.toMatch(/"(?:id|order)":/);
  });

  it("returns a typed missing-project outcome without unrelated content", async () => {
    await expect(loadProjectDetailPageData("missing-project")).resolves.toEqual(
      {
        kind: "not-found",
        requestedSlug: "missing-project",
      },
    );
  });
});
