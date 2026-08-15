import { describe, expect, it } from "vitest";

import { StaticContentRepository } from "../../app/content/static-content-repository.server";
import { validateContent } from "../../app/content/validate-content.server";
import type { ValidatedContentSnapshot } from "../../app/domain/content";
import {
  createValidAssetManifestFixture,
  createValidContentFixture,
} from "../fixtures/content";

function validatedFixture(): ValidatedContentSnapshot {
  return validateContent(
    createValidContentFixture(),
    createValidAssetManifestFixture(),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function setAtPath(
  value: unknown,
  path: readonly (string | number)[],
  replacement: unknown,
) {
  let current = value;

  for (const segment of path.slice(0, -1)) {
    if (Array.isArray(current) && typeof segment === "number") {
      current = current[segment];
    } else if (isRecord(current)) {
      current = current[String(segment)];
    } else {
      throw new Error("Fixture path is unavailable.");
    }
  }

  const finalSegment = path.at(-1);
  if (finalSegment === undefined)
    throw new Error("Fixture path cannot be empty.");

  if (Array.isArray(current) && typeof finalSegment === "number") {
    current[finalSegment] = replacement;
  } else if (isRecord(current)) {
    current[String(finalSegment)] = replacement;
  } else {
    throw new Error("Fixture path parent is not mutable.");
  }
}

function pushAtPath(
  value: unknown,
  path: readonly (string | number)[],
  item: unknown,
) {
  let current = value;

  for (const segment of path) {
    if (Array.isArray(current) && typeof segment === "number") {
      current = current[segment];
    } else if (isRecord(current)) {
      current = current[String(segment)];
    } else {
      throw new Error("Fixture path is unavailable.");
    }
  }

  if (!Array.isArray(current)) throw new Error("Fixture path is not an array.");
  current.push(item);
}

function createRepository(snapshot = validatedFixture()) {
  let loadCount = 0;
  const repository = new StaticContentRepository(
    {
      load() {
        loadCount += 1;
        return Promise.resolve(snapshot);
      },
    },
    () => new Date("2026-08-15T00:00:00.000Z"),
  );

  return { repository, loadCount: () => loadCount };
}

describe("StaticContentRepository", () => {
  it("validates through its adapter once and returns an ordered overview", async () => {
    const { repository, loadCount } = createRepository();
    const [overview, projects, writings] = await Promise.all([
      repository.getPortfolioOverview(),
      repository.getPublishedProjects(),
      repository.getPublishedWritings(),
    ]);

    expect(loadCount()).toBe(1);
    expect(overview.identity.approximateYearsExperience).toBe(7);
    expect(overview.contacts.map((contact) => contact.order)).toEqual([10, 30]);
    expect(overview.skillGroups[0]?.skills.map((skill) => skill.name)).toEqual([
      "TypeScript",
      "Testing",
    ]);
    expect(projects.items.map((project) => project.slug)).toEqual([
      "published-project",
    ]);
    expect(writings.items.map((writing) => writing.metadata.slug)).toEqual([
      "published-writing",
    ]);
  });

  it("excludes draft and archived records from collections and slug lists", async () => {
    const { repository } = createRepository();

    expect(await repository.getPublishedProjectSlugs()).toEqual([
      "published-project",
    ]);
    expect(await repository.getPublishedWritingSlugs()).toEqual([
      "published-writing",
    ]);
    expect(await repository.getProjectBySlug("draft-project")).toEqual({
      kind: "not-found",
      contentType: "project",
      requestedSlug: "draft-project",
    });
    expect(await repository.getWritingBySlug("archived-writing")).toEqual({
      kind: "not-found",
      contentType: "writing",
      requestedSlug: "archived-writing",
    });
  });

  it("returns typed found and not-found outcomes", async () => {
    const { repository } = createRepository();

    const foundProject = await repository.getProjectBySlug("published-project");
    const missingProject = await repository.getProjectBySlug("missing-project");
    const foundWriting = await repository.getWritingBySlug("published-writing");
    const missingWriting = await repository.getWritingBySlug("missing-writing");

    expect(foundProject.kind).toBe("found");
    expect(missingProject).toEqual({
      kind: "not-found",
      contentType: "project",
      requestedSlug: "missing-project",
    });
    expect(foundWriting.kind).toBe("found");
    expect(missingWriting).toEqual({
      kind: "not-found",
      contentType: "writing",
      requestedSlug: "missing-writing",
    });
  });

  it("orders published projects editorially and writings by publication date", async () => {
    const source = createValidContentFixture();
    const earlierProject = structuredClone(source.projects[0]);
    if (earlierProject === undefined)
      throw new Error("Missing project fixture.");
    setAtPath(earlierProject, ["id"], "project-earlier");
    setAtPath(earlierProject, ["slug"], "earlier-project");
    setAtPath(earlierProject, ["title"], "Earlier project");
    setAtPath(earlierProject, ["order"], 10);
    setAtPath(earlierProject, ["featuredOrder"], 10);
    setAtPath(earlierProject, ["decisions", 0, "id"], "decision-earlier");
    setAtPath(earlierProject, ["outcomes", 0, "id"], "outcome-earlier");
    setAtPath(earlierProject, ["links", 0, "id"], "link-earlier-project");
    setAtPath(
      earlierProject,
      ["links", 0, "href"],
      "/projects/earlier-project",
    );
    setAtPath(
      earlierProject,
      ["seo", "canonicalPath"],
      "/projects/earlier-project",
    );
    pushAtPath(source, ["projects"], earlierProject);

    const newerWriting = structuredClone(source.writings[0]);
    if (newerWriting === undefined) throw new Error("Missing writing fixture.");
    setAtPath(newerWriting, ["metadata", "id"], "writing-newer");
    setAtPath(newerWriting, ["metadata", "slug"], "newer-writing");
    setAtPath(newerWriting, ["metadata", "title"], "Newer writing");
    setAtPath(newerWriting, ["metadata", "publishedOn"], "2025-01-01");
    setAtPath(newerWriting, ["metadata", "updatedOn"], "2025-01-01");
    setAtPath(newerWriting, ["metadata", "featuredOrder"], 20);
    setAtPath(
      newerWriting,
      ["metadata", "seo", "canonicalPath"],
      "/writings/newer-writing",
    );
    pushAtPath(source, ["writings"], newerWriting);

    const snapshot = validateContent(source, createValidAssetManifestFixture());
    const { repository } = createRepository(snapshot);

    expect(await repository.getPublishedProjectSlugs()).toEqual([
      "earlier-project",
      "published-project",
    ]);
    expect(await repository.getPublishedWritingSlugs()).toEqual([
      "newer-writing",
      "published-writing",
    ]);
  });

  it("freezes returned content and omits source asset governance fields", async () => {
    const { repository } = createRepository();
    const overview = await repository.getPortfolioOverview();
    const projects = await repository.getPublishedProjects();

    expect(Object.isFrozen(overview)).toBe(true);
    expect(Object.isFrozen(overview.experiences)).toBe(true);
    expect(Object.isFrozen(projects.items[0])).toBe(true);
    expect(Reflect.set(overview.identity, "displayName", "Changed")).toBe(
      false,
    );
    expect(JSON.stringify(overview)).not.toContain("sourcePath");
    expect(JSON.stringify(overview)).not.toContain("sha256");
    expect(JSON.stringify(overview)).not.toContain("metadataRemovalVerified");
  });
});
