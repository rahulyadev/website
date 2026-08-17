import { describe, expect, it } from "vitest";

import { LocalContentAdapter } from "../../app/content/local-content-adapter.server";
import { internalPathSchema } from "../../app/content/content-schemas.server";
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
  it("accepts complete fixture and production snapshots", async () => {
    const fixture = createValidContentFixture();
    const snapshot = validateContent(
      fixture,
      createValidAssetManifestFixture(),
    );
    const productionSnapshot = await new LocalContentAdapter().load();

    expect(snapshot.projects).toHaveLength(3);
    expect(snapshot.writings).toHaveLength(3);
    expect(productionSnapshot.projects).toHaveLength(4);
    expect(productionSnapshot.projects.map((project) => project.slug)).toEqual([
      "tourney",
      "url-shortener",
      "portfolio-tracker",
      "universal-job-tracker",
    ]);
    expect(productionSnapshot.writings).toEqual([]);
    expect(productionSnapshot.site.resumeAssets).toHaveLength(1);
    expect(productionSnapshot.site.resumeAssets[0]).toMatchObject({
      publicationStatus: "published",
      path: "/assets/resume/rahul-yadav-resume.pdf",
    });
    expect(productionSnapshot.site.images).toHaveLength(19);
    expect(productionSnapshot.site.profileImage?.mainAssetIds).toHaveLength(9);
    expect(productionSnapshot.site.profileImage?.compactAssetIds).toHaveLength(
      6,
    );
  });

  it("keeps the approved Milestone 6 professional inventory exact", async () => {
    const productionSnapshot = await new LocalContentAdapter().load();
    const experiences = productionSnapshot.professional.experiences;
    const skillGroups = productionSnapshot.professional.skillGroups;
    const groupedSkillIds = skillGroups.flatMap((group) =>
      group.skills.map((reference) => reference.skillId),
    );

    expect(experiences.map((experience) => experience.organization)).toEqual([
      "Sopra Steria",
      "Gainfront",
      "MarsDevs",
    ]);
    expect(experiences.map((experience) => experience.featured)).toEqual([
      true,
      true,
      false,
    ]);
    expect(
      experiences.map((experience) => experience.roles[0]?.location),
    ).toEqual(["Bengaluru, India", "Bengaluru, India", "Pune, India"]);
    expect(experiences[0]?.roles[0]?.engagement).toEqual({
      relationship: "customer",
      organization: "Airbus",
    });
    expect(experiences[1]?.roles[0]?.engagement).toBeUndefined();
    expect(experiences[2]?.roles[0]?.engagement).toBeUndefined();

    expect(skillGroups.map((group) => group.name)).toEqual([
      "Languages",
      "Backend and APIs",
      "Frontend",
      "Databases, caching, and asynchronous processing",
      "Cloud and infrastructure",
      "Testing, quality, and developer tooling",
    ]);
    expect(skillGroups.map((group) => group.skills.length)).toEqual([
      3, 13, 6, 6, 10, 6,
    ]);
    expect(groupedSkillIds).toHaveLength(44);
    expect(new Set(groupedSkillIds)).toHaveProperty("size", 44);
    expect(
      productionSnapshot.professional.skills.map((skill) => skill.name),
    ).not.toContain("PHP");
    expect(
      productionSnapshot.professional.credibilityHighlights.map(
        ({ id, supportingClaimIds }) => ({ id, supportingClaimIds }),
      ),
    ).toEqual([
      {
        id: "highlight-modernization-architecture",
        supportingClaimIds: ["claim-sopra-modernization"],
      },
      {
        id: "highlight-full-stack-delivery",
        supportingClaimIds: ["claim-gainfront-greenfield"],
      },
      {
        id: "highlight-delivery-leadership",
        supportingClaimIds: ["claim-sopra-leadership"],
      },
      {
        id: "highlight-api-payload",
        supportingClaimIds: ["claim-sopra-payload-reduction"],
      },
      {
        id: "highlight-test-coverage",
        supportingClaimIds: ["claim-gainfront-testing"],
      },
    ]);

    expect(productionSnapshot.professional.education).toEqual([
      expect.objectContaining({
        institution: "University of Mumbai",
        credential: "Bachelor of Engineering",
        fieldOfStudy: "Computer Engineering",
        score: "CGPA 8.74/10",
      }),
    ]);
    expect(
      productionSnapshot.site.images.filter((image) =>
        image.path.startsWith("/assets/organizations/"),
      ),
    ).toHaveLength(4);
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
    expect(payloadHighlight?.lead).toBe(
      "Reduced primary data-grid API payloads from ~1.5-2 MB to <1 MB.",
    );
    expect(payloadHighlight?.supportingClaimIds).toEqual([
      "claim-sopra-payload-reduction",
    ]);
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
      ["projects", 0, "seo", "canonicalPath"],
      "/projects/../private",
    ],
    [
      "encoded separator",
      ["projects", 0, "seo", "canonicalPath"],
      "/projects%2fprivate",
    ],
    [
      "duplicate internal separator",
      ["projects", 0, "seo", "canonicalPath"],
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
  ])("accepts a valid %s", (_name, path, value) => {
    const fixture = createValidContentFixture();
    setAtPath(fixture, path, value);

    expect(() =>
      validateContent(fixture, createValidAssetManifestFixture()),
    ).not.toThrow();
  });

  it.each(["/", "/projects/example"])(
    "accepts the normalized internal path %s",
    (value) => {
      expect(internalPathSchema.safeParse(value).success).toBe(true);
    },
  );

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

  it("rejects non-chronological employers and duplicate public skill placement", () => {
    const chronology = createValidContentFixture();
    const newerExperience = structuredClone(
      chronology.professional.experiences[0],
    );
    if (newerExperience === undefined) {
      throw new Error("Missing experience fixture.");
    }
    setAtPath(newerExperience, ["id"], "experience-newer");
    setAtPath(newerExperience, ["organization"], "Newer Company");
    setAtPath(newerExperience, ["order"], 20);
    setAtPath(newerExperience, ["roles", 0, "id"], "role-newer");
    setAtPath(newerExperience, ["roles", 0, "dates"], {
      start: "2025-01",
      end: { kind: "present" },
    });
    arrayAt(newerExperience, ["roles", 0, "responsibilities"]).forEach(
      (responsibility, index) => {
        setAtPath(responsibility, ["id"], `claim-newer-${String(index + 1)}`);
      },
    );
    arrayAt(chronology, ["professional", "experiences"]).push(newerExperience);
    expect(expectInvalid(chronology).message).toContain(
      "reverse-chronological employer ordering",
    );

    const duplicateSkill = createValidContentFixture();
    arrayAt(duplicateSkill, ["professional", "skillGroups"]).push({
      id: "skill-group-duplicate",
      category: "backend",
      name: "Duplicate group",
      skills: [{ skillId: "skill-typescript", order: 10 }],
      order: 20,
    });
    expect(expectInvalid(duplicateSkill).message).toContain(
      "appears in more than one public skill group",
    );
  });

  it("rejects unknown, incorrectly purposed, and mismatched logo records", () => {
    const unknownLogo = createValidContentFixture();
    setAtPath(
      unknownLogo,
      ["professional", "experiences", 0, "logoAssetId"],
      "image-unknown-logo",
    );
    expect(expectInvalid(unknownLogo).message).toContain(
      "references an unknown logo asset",
    );

    const wrongPurpose = createValidContentFixture();
    setAtPath(
      wrongPurpose,
      ["professional", "experiences", 0, "logoAssetId"],
      "image-education-logo",
    );
    expect(expectInvalid(wrongPurpose).message).toContain(
      "instead of experience-employer-logo",
    );

    const mismatchedManifest = structuredClone(
      createValidAssetManifestFixture(),
    );
    setAtPath(mismatchedManifest, [2, "publicDerivativeWidth"], 201);
    expect(
      expectInvalid(createValidContentFixture(), mismatchedManifest).message,
    ).toContain("governance does not match its public derivative");
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
      "project SEO image",
      ["projects", 0, "seo", "socialImageAssetId"],
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

  it("rejects duplicate or incomplete planned stacks and unknown statuses", () => {
    const fixture = createValidContentFixture();
    arrayAt(fixture, ["projects", 0, "plannedStack"]).push("TypeScript");
    expect(expectInvalid(fixture).message).toContain(
      "duplicates technology label TypeScript",
    );

    const emptyStack = createValidContentFixture();
    setAtPath(emptyStack, ["projects", 0, "plannedStack"], []);
    expect(expectInvalid(emptyStack).message).toContain(
      "at least one planned technology",
    );

    const unknownStatus = createValidContentFixture();
    setAtPath(unknownStatus, ["projects", 0, "status"], "planning");
    expect(expectInvalid(unknownStatus).message).toMatch(/wip|beta|live/);

    const missingHomeTechnology = createValidContentFixture();
    setAtPath(missingHomeTechnology, ["projects", 0, "homeStack", 0], "React");
    expect(expectInvalid(missingHomeTechnology).message).toContain(
      "complete planned stack",
    );
  });

  it("rejects incomplete published records", () => {
    const project = createValidContentFixture();
    deleteAtPath(project, ["projects", 0, "summary"]);
    expect(expectInvalid(project).message).toContain("expected string");

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

    const linksNotValidated = structuredClone(
      createValidAssetManifestFixture(),
    );
    setAtPath(linksNotValidated, [0, "linkValidationVerified"], false);
    const publishedResume = createValidContentFixture();
    setAtPath(
      publishedResume,
      ["site", "resumeAssets", 0, "publicationStatus"],
      "published",
    );
    expect(expectInvalid(publishedResume, linksNotValidated).message).toContain(
      "verify PDF links",
    );

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
