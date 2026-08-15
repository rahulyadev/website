import { describe, expect, it } from "vitest";

import { LocalContentAdapter } from "../../app/content/local-content-adapter.server";
import {
  ContentValidationError,
  validateContent,
} from "../../app/content/validate-content.server";
import {
  createValidAssetManifestFixture,
  createValidContentFixture,
} from "../fixtures/content";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function childAt(value: unknown, segment: string | number): unknown {
  if (Array.isArray(value) && typeof segment === "number") {
    return value[segment];
  }

  if (isRecord(value)) {
    return value[String(segment)];
  }

  throw new Error(`Fixture path segment ${String(segment)} is unavailable.`);
}

function setAtPath(
  value: unknown,
  path: readonly (string | number)[],
  replacement: unknown,
) {
  const parent = path.slice(0, -1).reduce(childAt, value);
  const finalSegment = path.at(-1);

  if (finalSegment === undefined)
    throw new Error("Fixture path cannot be empty.");

  if (Array.isArray(parent) && typeof finalSegment === "number") {
    parent[finalSegment] = replacement;
    return;
  }

  if (isRecord(parent)) {
    parent[String(finalSegment)] = replacement;
    return;
  }

  throw new Error("Fixture path parent is not mutable.");
}

function deleteAtPath(value: unknown, path: readonly (string | number)[]) {
  const parent = path.slice(0, -1).reduce(childAt, value);
  const finalSegment = path.at(-1);

  if (finalSegment === undefined || !isRecord(parent)) {
    throw new Error("Fixture path cannot be deleted.");
  }

  Reflect.deleteProperty(parent, String(finalSegment));
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function arrayAt(value: unknown, path: readonly (string | number)[]) {
  const result = path.reduce(childAt, value);
  if (!isUnknownArray(result)) throw new Error("Fixture path is not an array.");
  return result;
}

function expectInvalid(
  source: unknown,
  manifest: unknown = createValidAssetManifestFixture(),
) {
  try {
    validateContent(source, manifest);
  } catch (error) {
    if (error instanceof ContentValidationError) return error;
    throw error;
  }

  throw new Error("Expected content validation to fail.");
}

describe("content validation", () => {
  it("accepts a complete snapshot and the empty production collections", async () => {
    const fixture = createValidContentFixture();
    const snapshot = validateContent(
      fixture,
      createValidAssetManifestFixture(),
    );
    const productionSnapshot = await new LocalContentAdapter().load();

    expect(snapshot.projects).toHaveLength(3);
    expect(snapshot.writings).toHaveLength(3);
    expect(productionSnapshot.projects).toEqual([]);
    expect(productionSnapshot.writings).toEqual([]);
    expect(productionSnapshot.site.resumeAssets).toEqual([]);
    expect(productionSnapshot.site.images).toEqual([]);
  });

  it("keeps production role technologies and payload wording source-specific", async () => {
    const productionSnapshot = await new LocalContentAdapter().load();
    const sopraRole = productionSnapshot.professional.experiences
      .find((experience) => experience.id === "experience-sopra-steria")
      ?.roles.at(0);
    const gainfrontRole = productionSnapshot.professional.experiences
      .find((experience) => experience.id === "experience-gainfront")
      ?.roles.at(0);
    const skillIds = productionSnapshot.professional.skills.map(
      (skill) => skill.id,
    );
    const payloadHighlight =
      productionSnapshot.professional.credibilityHighlights.find(
        (highlight) => highlight.id === "highlight-api-payload",
      );

    expect(sopraRole?.technologyIds).not.toContain("skill-postgresql");
    expect(sopraRole?.technologyIds).not.toContain("skill-redis");
    expect(gainfrontRole?.technologyIds).toContain("skill-aws-ecs");
    expect(gainfrontRole?.technologyIds).not.toContain("skill-aws-fargate");
    expect(gainfrontRole?.technologyIds).not.toContain("skill-ci-cd");
    expect(skillIds).toEqual(
      expect.arrayContaining([
        "skill-postgresql",
        "skill-redis",
        "skill-aws-fargate",
        "skill-ci-cd",
      ]),
    );
    expect(payloadHighlight?.statement).toBe(
      "Reduced primary data-grid API payloads from ~1.5-2 MB to <1 MB.",
    );
  });

  it("reports missing and empty required fields without echoing their values", () => {
    const missing = createValidContentFixture();
    deleteAtPath(missing, ["site", "identity", "displayName"]);
    const missingError = expectInvalid(missing);

    const empty = createValidContentFixture();
    setAtPath(empty, ["professional", "experiences", 0, "organization"], " ");
    const emptyError = expectInvalid(empty);

    expect(missingError.diagnostics[0]).toMatchObject({
      recordType: "SiteIdentity",
      fieldPath: "site.identity.displayName",
    });
    expect(emptyError.diagnostics[0]?.reason).toContain("nonempty");
    expect(emptyError.message).not.toContain("Example Company");
  });

  it.each([
    [
      "URL credentials",
      ["site", "socialLinks", 0, "url"],
      "https://user:secret@example.test/profile",
    ],
    [
      "JavaScript URL",
      ["site", "socialLinks", 0, "url"],
      "javascript:alert(1)",
    ],
    ["data URL", ["site", "socialLinks", 0, "url"], "data:text/plain,unsafe"],
    ["file URL", ["site", "socialLinks", 0, "url"], "file:///private/value"],
    [
      "protocol-relative URL",
      ["site", "socialLinks", 0, "url"],
      "//example.test/profile",
    ],
    [
      "non-absolute HTTPS URL",
      ["site", "socialLinks", 0, "url"],
      "https:example.test/profile",
    ],
    [
      "leading HTTPS whitespace",
      ["site", "socialLinks", 0, "url"],
      " https://example.test/profile",
    ],
    [
      "trailing HTTPS whitespace",
      ["site", "socialLinks", 0, "url"],
      "https://example.test/profile ",
    ],
    [
      "URL backslash",
      ["site", "socialLinks", 0, "url"],
      "https://example.test\\unsafe",
    ],
    [
      "HTTPS traversal",
      ["site", "socialLinks", 0, "url"],
      "https://example.test/a/../private",
    ],
    [
      "internal traversal",
      ["projects", 0, "links", 0, "href"],
      "/projects/../private",
    ],
    [
      "encoded separator",
      ["projects", 0, "links", 0, "href"],
      "/projects%2fprivate",
    ],
    [
      "duplicate internal separator",
      ["projects", 0, "links", 0, "href"],
      "/projects//published-project",
    ],
  ])("rejects %s", (_name, path, value) => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, path, value);

    expect(expectInvalid(fixture).diagnostics[0]?.reason).toMatch(
      /safe|HTTPS|credentials|root-relative/i,
    );
  });

  it.each([
    [
      "trimmed HTTPS URL",
      ["site", "socialLinks", 0, "url"],
      "https://example.test/profile",
    ],
    ["root internal path", ["projects", 0, "links", 0, "href"], "/"],
    [
      "nested internal path",
      ["projects", 0, "links", 0, "href"],
      "/projects/example",
    ],
  ])("accepts a valid %s", (_name, path, value) => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, path, value);

    expect(() =>
      validateContent(fixture, createValidAssetManifestFixture()),
    ).not.toThrow();
  });

  it.each([
    ["year precision", "2020"],
    ["month precision", "2020-02"],
    ["day precision", "2020-02-29"],
  ])("accepts valid %s", (_name, date) => {
    const fixture = createValidContentFixture();
    setAtPath(
      fixture,
      ["professional", "experiences", 0, "roles", 0, "dates", "start"],
      date,
    );

    expect(() =>
      validateContent(fixture, createValidAssetManifestFixture()),
    ).not.toThrow();
  });

  it.each(["2023-02-29", "2024-13", "2024-04-31", "2024-01-00"])(
    "rejects invalid calendar date %s",
    (date) => {
      const fixture = createValidContentFixture();
      setAtPath(
        fixture,
        ["professional", "experiences", 0, "roles", 0, "dates", "start"],
        date,
      );

      expect(expectInvalid(fixture).diagnostics[0]?.reason).toContain(
        "valid calendar date",
      );
    },
  );

  it("accepts present ranges and rejects reversed finite ranges", () => {
    const present = createValidContentFixture();
    expect(() =>
      validateContent(present, createValidAssetManifestFixture()),
    ).not.toThrow();

    const reversed = createValidContentFixture();
    setAtPath(
      reversed,
      ["professional", "experiences", 0, "roles", 0, "dates"],
      { start: "2025-06", end: { kind: "date", value: "2024-12" } },
    );

    expect(expectInvalid(reversed).diagnostics[0]?.reason).toContain(
      "precedes start date",
    );
  });

  it("rejects reverse education ranges at the shared date boundary", () => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, ["professional", "education", 0, "dates"], {
      start: "2021",
      end: { kind: "date", value: "2020-12" },
    });

    const error = expectInvalid(fixture);
    expect(error.diagnostics).toContainEqual(
      expect.objectContaining({
        recordType: "Education",
        recordId: "education-example",
        fieldPath: "professional.education.0.dates.end",
        reason: "end date precedes start date",
      }),
    );
  });

  it("accepts valid education and overlapping mixed-precision ranges", () => {
    const education = createValidContentFixture();
    setAtPath(education, ["professional", "education", 0, "dates"], {
      start: "2016",
      end: { kind: "date", value: "2020-06" },
    });

    const mixedPrecision = createValidContentFixture();
    setAtPath(
      mixedPrecision,
      ["professional", "experiences", 0, "roles", 0, "dates"],
      { start: "2020", end: { kind: "date", value: "2020-01" } },
    );

    expect(() =>
      validateContent(education, createValidAssetManifestFixture()),
    ).not.toThrow();
    expect(() =>
      validateContent(mixedPrecision, createValidAssetManifestFixture()),
    ).not.toThrow();
  });

  it("rejects an update date before publication", () => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, ["writings", 0, "metadata", "updatedOn"], "2024-02-28");

    expect(expectInvalid(fixture).diagnostics[0]?.reason).toContain(
      "precedes publishedOn",
    );
  });

  it("detects duplicate global IDs and project or writing slugs", () => {
    const duplicateId = createValidContentFixture();
    setAtPath(
      duplicateId,
      ["professional", "skills", 1, "id"],
      "skill-typescript",
    );
    expect(expectInvalid(duplicateId).message).toContain(
      "duplicates the stable ID",
    );

    const projectSlug = createValidContentFixture();
    setAtPath(projectSlug, ["projects", 1, "slug"], "published-project");
    expect(expectInvalid(projectSlug).message).toContain(
      "duplicates projects.slug",
    );

    const writingSlug = createValidContentFixture();
    setAtPath(
      writingSlug,
      ["writings", 1, "metadata", "slug"],
      "published-writing",
    );
    expect(expectInvalid(writingSlug).message).toContain(
      "duplicates writings.slug",
    );
  });

  it("allows non-contiguous ordering and rejects non-positive or duplicate sibling orders", () => {
    const valid = createValidContentFixture();
    expect(() =>
      validateContent(valid, createValidAssetManifestFixture()),
    ).not.toThrow();

    const duplicate = createValidContentFixture();
    setAtPath(
      duplicate,
      [
        "professional",
        "experiences",
        0,
        "roles",
        0,
        "responsibilities",
        1,
        "order",
      ],
      10,
    );
    expect(expectInvalid(duplicate).message).toContain(
      "duplicates sibling order",
    );

    const nonPositive = createValidContentFixture();
    setAtPath(nonPositive, ["site", "contacts", 0, "order"], 0);
    expect(expectInvalid(nonPositive).message).toContain("positive");
  });

  it.each([
    [
      "skill",
      ["professional", "skillGroups", 0, "skills", 0, "skillId"],
      "skill-missing",
      "unknown skill",
    ],
    [
      "role technology",
      ["professional", "experiences", 0, "roles", 0, "technologyIds", 0],
      "skill-missing",
      "unknown skill",
    ],
    [
      "claim",
      ["professional", "credibilityHighlights", 0, "supportingClaimIds", 0],
      "claim-missing",
      "unknown experience claim",
    ],
    [
      "related project",
      ["projects", 0, "relatedProjectIds", 0],
      "project-missing",
      "unknown project",
    ],
    [
      "project image",
      ["projects", 0, "imageAssetIds", 0],
      "image-missing",
      "unknown image asset",
    ],
    [
      "SEO image",
      ["site", "seo", "home", "socialImageAssetId"],
      "image-missing",
      "unknown image asset",
    ],
  ])("detects a broken %s reference", (_name, path, value, reason) => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, path, value);

    expect(expectInvalid(fixture).message).toContain(reason);
  });

  it("rejects project self-references", () => {
    const fixture = createValidContentFixture();
    arrayAt(fixture, ["projects", 0, "relatedProjectIds"]).push(
      "project-published",
    );

    expect(expectInvalid(fixture).message).toContain("cannot reference itself");
  });

  it("rejects incomplete published records", () => {
    const project = createValidContentFixture();
    deleteAtPath(project, ["projects", 0, "summary"]);
    expect(expectInvalid(project).message).toContain(
      "published projects require complete",
    );

    const writing = createValidContentFixture();
    deleteAtPath(writing, ["writings", 0, "article"]);
    expect(expectInvalid(writing).message).toContain(
      "published writings require summary",
    );
  });

  it("validates the separate asset manifest and publication metadata", () => {
    const badHash = structuredClone(createValidAssetManifestFixture());
    setAtPath(badHash, [0, "sha256"], "not-a-hash");
    const badHashError = expectInvalid(createValidContentFixture(), badHash);
    expect(badHashError.message).toContain("SHA-256");
    expect(badHashError.diagnostics[0]).toMatchObject({
      recordType: "BuildAssetManifest",
      recordId: "resume-example",
      fieldPath: "assetManifest.0.sha256",
    });

    const missingManifest = createValidAssetManifestFixture().slice(1);
    expect(
      expectInvalid(createValidContentFixture(), missingManifest).message,
    ).toContain("missing its separate build asset manifest entry");

    const metadataNotRemoved = structuredClone(
      createValidAssetManifestFixture(),
    );
    setAtPath(metadataNotRemoved, [1, "metadataRemovalVerified"], false);
    expect(
      expectInvalid(createValidContentFixture(), metadataNotRemoved).message,
    ).toContain("verify metadata removal");

    const badExtension = createValidContentFixture();
    setAtPath(badExtension, ["site", "images", 0, "path"], "/assets/image.png");
    expect(expectInvalid(badExtension).message).toContain(
      "extension must match",
    );
  });

  it("aggregates diagnostics with record type, ID, field path, and reason", () => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, ["site", "identity", "displayName"], "");
    setAtPath(fixture, ["site", "socialLinks", 0, "url"], "http://unsafe.test");

    const error = expectInvalid(fixture);

    expect(error.diagnostics).toHaveLength(2);
    for (const diagnostic of error.diagnostics) {
      expect(diagnostic.recordType).not.toBe("");
      expect(diagnostic.recordId).not.toBe("");
      expect(diagnostic.fieldPath).not.toBe("");
      expect(diagnostic.reason).not.toBe("");
    }
  });
});
