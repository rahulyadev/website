import type { z } from "zod";

import type {
  LocalContentSource,
  PublishedWriting,
  UnpublishedWriting,
  ValidatedContentSnapshot,
  WritingRecord,
} from "../domain/content";
import {
  buildAssetManifestEntrySchema,
  localContentSourceSchema,
  type BuildAssetManifestEntry,
} from "./content-schemas.server";

export interface ContentDiagnostic {
  readonly recordType: string;
  readonly recordId: string;
  readonly fieldPath: string;
  readonly reason: string;
}

export class ContentValidationError extends Error {
  readonly diagnostics: readonly ContentDiagnostic[];

  constructor(diagnostics: readonly ContentDiagnostic[]) {
    const details = diagnostics
      .map(
        (diagnostic) =>
          `[${diagnostic.recordType} ${diagnostic.recordId}] ${diagnostic.fieldPath}: ${diagnostic.reason}`,
      )
      .join("\n");
    super(
      `Public content validation failed with ${String(diagnostics.length)} issue(s):\n${details}`,
    );
    this.name = "ContentValidationError";
    this.diagnostics = diagnostics;
  }
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordTypeForPath(path: readonly PropertyKey[]) {
  const joined = path.map(String).join(".");

  if (joined.startsWith("site.identity")) return "SiteIdentity";
  if (joined.startsWith("site.seo")) return "SeoDefaults";
  if (joined.startsWith("site.contacts")) return "ContactLink";
  if (joined.startsWith("site.socialLinks")) return "SocialLink";
  if (joined.startsWith("site.resumeAssets")) return "ResumeAsset";
  if (joined.startsWith("site.images")) return "ImageAsset";
  if (joined.startsWith("site.profileImage")) return "ProfileImage";
  if (joined.includes("responsibilities")) return "ExperienceClaim";
  if (joined.includes("roles")) return "ExperienceRole";
  if (joined.startsWith("professional.experiences")) return "Experience";
  if (joined.startsWith("professional.credibilityHighlights"))
    return "CredibilityHighlight";
  if (joined.startsWith("professional.skillGroups")) return "SkillGroup";
  if (joined.startsWith("professional.skills")) return "Skill";
  if (joined.startsWith("professional.education")) return "Education";
  if (joined.startsWith("projects")) return "Project";
  if (joined.startsWith("writings")) return "Writing";
  if (joined.startsWith("assetManifest")) return "BuildAssetManifest";
  return "Content";
}

function recordIdForPath(input: unknown, path: readonly PropertyKey[]) {
  let current: unknown = input;
  let recordId = "<unknown>";

  for (const segment of path) {
    if (isUnknownRecord(current)) {
      const id = current["id"];
      const assetId = current["assetId"];
      const metadata = current["metadata"];

      if (typeof id === "string") {
        recordId = id;
      } else if (typeof assetId === "string") {
        recordId = assetId;
      } else if (
        isUnknownRecord(metadata) &&
        typeof metadata["id"] === "string"
      ) {
        recordId = metadata["id"];
      }

      current = current[String(segment)];
    } else if (Array.isArray(current) && typeof segment === "number") {
      current = current[segment];
    } else {
      break;
    }
  }

  if (isUnknownRecord(current)) {
    if (typeof current["id"] === "string") {
      recordId = current["id"];
    } else if (typeof current["assetId"] === "string") {
      recordId = current["assetId"];
    }
  }

  return recordId;
}

function diagnosticFromIssue(
  issue: z.core.$ZodIssue,
  input: unknown,
): ContentDiagnostic {
  return {
    recordType: recordTypeForPath(issue.path),
    recordId: recordIdForPath(input, issue.path),
    fieldPath: issue.path.map(String).join(".") || "<root>",
    reason: issue.message,
  };
}

function hasPublishedWritingFields(
  writing: WritingRecord,
): writing is PublishedWriting {
  return (
    writing.metadata.publicationStatus === "published" &&
    writing.metadata.summary !== undefined &&
    writing.metadata.publishedOn !== undefined &&
    writing.metadata.seo !== undefined &&
    writing.article !== undefined
  );
}

function isUnpublishedWriting(
  writing: WritingRecord,
): writing is UnpublishedWriting {
  return writing.metadata.publicationStatus !== "published";
}

function writingProjection(
  writing: WritingRecord,
): PublishedWriting | UnpublishedWriting {
  if (hasPublishedWritingFields(writing) || isUnpublishedWriting(writing)) {
    return writing;
  }

  throw new Error("Validated published writing lost publication eligibility.");
}

function validateCrossRecordRules(
  source: LocalContentSource,
  assetManifest: readonly BuildAssetManifestEntry[],
) {
  const diagnostics: ContentDiagnostic[] = [];
  const ids = new Map<
    string,
    { readonly recordType: string; readonly path: string }
  >();

  const add = (
    recordType: string,
    recordId: string,
    fieldPath: string,
    reason: string,
  ) => {
    diagnostics.push({ recordType, recordId, fieldPath, reason });
  };

  const registerId = (recordType: string, id: string, path: string) => {
    const existing = ids.get(id);

    if (existing !== undefined) {
      add(
        recordType,
        id,
        path,
        `duplicates the stable ID already used by ${existing.recordType} at ${existing.path}`,
      );
      return;
    }

    ids.set(id, { recordType, path });
  };

  const checkOrders = <T>(
    values: readonly T[],
    recordType: string,
    fieldPath: string,
    idOf: (value: T) => string,
    orderOf: (value: T) => number | undefined,
  ) => {
    const orders = new Map<number, string>();

    values.forEach((value, index) => {
      const order = orderOf(value);

      if (order === undefined) return;
      const existing = orders.get(order);
      const id = idOf(value);

      if (existing !== undefined) {
        add(
          recordType,
          id,
          `${fieldPath}.${String(index)}.order`,
          `duplicates sibling order ${String(order)} already used by ${existing}`,
        );
      } else {
        orders.set(order, id);
      }
    });
  };

  const checkUniqueReferences = (
    references: readonly string[],
    recordType: string,
    recordId: string,
    fieldPath: string,
  ) => {
    const seen = new Set<string>();

    references.forEach((reference, index) => {
      if (seen.has(reference)) {
        add(
          recordType,
          recordId,
          `${fieldPath}.${String(index)}`,
          "duplicates a reference in the same collection",
        );
      }
      seen.add(reference);
    });
  };

  const checkUniqueLabels = (
    labels: readonly string[],
    recordType: string,
    recordId: string,
    fieldPath: string,
  ) => {
    const seen = new Map<string, string>();

    labels.forEach((label, index) => {
      const normalized = label.toLocaleLowerCase("en-US");
      const existing = seen.get(normalized);
      if (existing !== undefined) {
        add(
          recordType,
          recordId,
          `${fieldPath}.${String(index)}`,
          `duplicates technology label ${existing}`,
        );
      } else {
        seen.set(normalized, label);
      }
    });
  };

  registerId("SiteIdentity", source.site.identity.id, "site.identity.id");
  registerId("SeoDefaults", source.site.seo.id, "site.seo.id");

  for (const [field, expectedPath] of [
    ["home", "/"],
    ["projects", "/projects"],
    ["writings", "/writings"],
  ] as const) {
    if (source.site.seo[field].canonicalPath !== expectedPath) {
      add(
        "SeoDefaults",
        source.site.seo.id,
        `site.seo.${field}.canonicalPath`,
        `must be ${expectedPath}`,
      );
    }
  }

  source.site.contacts.forEach((contact, index) => {
    registerId("ContactLink", contact.id, `site.contacts.${String(index)}.id`);
  });
  source.site.socialLinks.forEach((link, index) => {
    registerId("SocialLink", link.id, `site.socialLinks.${String(index)}.id`);
  });
  source.site.resumeAssets.forEach((asset, index) => {
    registerId(
      "ResumeAsset",
      asset.id,
      `site.resumeAssets.${String(index)}.id`,
    );
  });
  source.site.images.forEach((asset, index) => {
    registerId("ImageAsset", asset.id, `site.images.${String(index)}.id`);
  });
  if (source.site.profileImage !== undefined) {
    registerId(
      "ProfileImage",
      source.site.profileImage.id,
      "site.profileImage.id",
    );
  }

  source.professional.experiences.forEach((experience, experienceIndex) => {
    registerId(
      "Experience",
      experience.id,
      `professional.experiences.${String(experienceIndex)}.id`,
    );

    experience.roles.forEach((role, roleIndex) => {
      registerId(
        "ExperienceRole",
        role.id,
        `professional.experiences.${String(experienceIndex)}.roles.${String(roleIndex)}.id`,
      );
      role.responsibilities.forEach((claim, claimIndex) => {
        registerId(
          "ExperienceClaim",
          claim.id,
          `professional.experiences.${String(experienceIndex)}.roles.${String(roleIndex)}.responsibilities.${String(claimIndex)}.id`,
        );
      });

      checkOrders(
        role.responsibilities,
        "ExperienceClaim",
        `professional.experiences.${String(experienceIndex)}.roles.${String(roleIndex)}.responsibilities`,
        (claim) => claim.id,
        (claim) => claim.order,
      );
      checkUniqueReferences(
        role.technologyIds,
        "ExperienceRole",
        role.id,
        `professional.experiences.${String(experienceIndex)}.roles.${String(roleIndex)}.technologyIds`,
      );
    });

    checkOrders(
      experience.roles,
      "ExperienceRole",
      `professional.experiences.${String(experienceIndex)}.roles`,
      (role) => role.id,
      (role) => role.order,
    );
  });

  source.professional.credibilityHighlights.forEach((highlight, index) => {
    registerId(
      "CredibilityHighlight",
      highlight.id,
      `professional.credibilityHighlights.${String(index)}.id`,
    );
  });
  source.professional.skills.forEach((skill, index) => {
    registerId("Skill", skill.id, `professional.skills.${String(index)}.id`);
  });
  source.professional.skillGroups.forEach((group, index) => {
    registerId(
      "SkillGroup",
      group.id,
      `professional.skillGroups.${String(index)}.id`,
    );
  });
  source.professional.education.forEach((education, index) => {
    registerId(
      "Education",
      education.id,
      `professional.education.${String(index)}.id`,
    );
  });

  source.projects.forEach((project, projectIndex) => {
    registerId("Project", project.id, `projects.${String(projectIndex)}.id`);
    project.plannedCapabilities.forEach((capability, capabilityIndex) => {
      registerId(
        "ProjectCapability",
        capability.id,
        `projects.${String(projectIndex)}.plannedCapabilities.${String(capabilityIndex)}.id`,
      );
    });
    project.laterPossibilities.forEach((possibility, possibilityIndex) => {
      registerId(
        "ProjectPossibility",
        possibility.id,
        `projects.${String(projectIndex)}.laterPossibilities.${String(possibilityIndex)}.id`,
      );
    });
  });

  source.writings.forEach((writing, writingIndex) => {
    registerId(
      "Writing",
      writing.metadata.id,
      `writings.${String(writingIndex)}.metadata.id`,
    );
  });

  checkOrders(
    source.site.contacts,
    "ContactLink",
    "site.contacts",
    (contact) => contact.id,
    (contact) => contact.order,
  );
  checkOrders(
    source.site.socialLinks,
    "SocialLink",
    "site.socialLinks",
    (link) => link.id,
    (link) => link.order,
  );
  checkOrders(
    source.professional.experiences,
    "Experience",
    "professional.experiences",
    (experience) => experience.id,
    (experience) => experience.order,
  );
  const orderedExperiences = [...source.professional.experiences].sort(
    (left, right) => left.order - right.order,
  );
  orderedExperiences.forEach((experience, index) => {
    const previous = orderedExperiences[index - 1];
    if (previous === undefined) return;

    const latestStart = (candidate: (typeof orderedExperiences)[number]) =>
      [...candidate.roles]
        .map((role) => role.dates.start)
        .sort((left, right) => right.localeCompare(left))[0] ?? "";

    if (latestStart(previous).localeCompare(latestStart(experience)) < 0) {
      add(
        "Experience",
        experience.id,
        `professional.experiences.${String(index)}.order`,
        "must preserve reverse-chronological employer ordering",
      );
    }
  });
  source.professional.experiences.forEach((experience, experienceIndex) => {
    const orderedRoles = [...experience.roles].sort(
      (left, right) => left.order - right.order,
    );
    orderedRoles.forEach((role, roleIndex) => {
      const previous = orderedRoles[roleIndex - 1];
      if (
        previous !== undefined &&
        previous.dates.start.localeCompare(role.dates.start) < 0
      ) {
        add(
          "ExperienceRole",
          role.id,
          `professional.experiences.${String(experienceIndex)}.roles.${String(roleIndex)}.order`,
          "must preserve reverse-chronological role ordering",
        );
      }
    });
  });
  checkOrders(
    source.professional.credibilityHighlights,
    "CredibilityHighlight",
    "professional.credibilityHighlights",
    (highlight) => highlight.id,
    (highlight) => highlight.order,
  );
  checkOrders(
    source.professional.skillGroups,
    "SkillGroup",
    "professional.skillGroups",
    (group) => group.id,
    (group) => group.order,
  );
  source.professional.skillGroups.forEach((group, groupIndex) => {
    checkOrders(
      group.skills,
      "SkillReference",
      `professional.skillGroups.${String(groupIndex)}.skills`,
      (reference) => reference.skillId,
      (reference) => reference.order,
    );
  });
  checkOrders(
    source.professional.education,
    "Education",
    "professional.education",
    (education) => education.id,
    (education) => education.order,
  );
  checkOrders(
    source.projects,
    "Project",
    "projects",
    (project) => project.id,
    (project) => project.order,
  );
  checkOrders(
    source.writings,
    "Writing",
    "writings.featured",
    (writing) => writing.metadata.id,
    (writing) => writing.metadata.featuredOrder,
  );

  source.projects.forEach((project, projectIndex) => {
    checkOrders(
      project.plannedCapabilities,
      "ProjectCapability",
      `projects.${String(projectIndex)}.plannedCapabilities`,
      (capability) => capability.id,
      (capability) => capability.order,
    );
    checkOrders(
      project.laterPossibilities,
      "ProjectPossibility",
      `projects.${String(projectIndex)}.laterPossibilities`,
      (possibility) => possibility.id,
      (possibility) => possibility.order,
    );
  });

  const duplicateValue = (
    records: readonly { readonly id: string; readonly value: string }[],
    recordType: string,
    fieldName: string,
  ) => {
    const values = new Map<string, string>();
    records.forEach((record, index) => {
      const existing = values.get(record.value);
      if (existing !== undefined) {
        add(
          recordType,
          record.id,
          `${fieldName}.${String(index)}`,
          `duplicates ${fieldName} already used by ${existing}`,
        );
      } else {
        values.set(record.value, record.id);
      }
    });
  };

  duplicateValue(
    source.projects.map((project) => ({ id: project.id, value: project.slug })),
    "Project",
    "projects.slug",
  );
  duplicateValue(
    source.projects.map((project) => ({
      id: project.id,
      value: project.plannedDestination,
    })),
    "Project",
    "projects.plannedDestination",
  );
  duplicateValue(
    source.writings.map((writing) => ({
      id: writing.metadata.id,
      value: writing.metadata.slug,
    })),
    "Writing",
    "writings.slug",
  );
  duplicateValue(
    [
      ...source.site.resumeAssets.map((asset) => ({
        id: asset.id,
        value: asset.path,
      })),
      ...source.site.images.map((asset) => ({
        id: asset.id,
        value: asset.path,
      })),
    ],
    "Asset",
    "site.assets.path",
  );

  const skillIds = new Set(source.professional.skills.map((skill) => skill.id));
  const claimIds = new Set(
    source.professional.experiences.flatMap((experience) =>
      experience.roles.flatMap((role) =>
        role.responsibilities.map((claim) => claim.id),
      ),
    ),
  );
  const imageById = new Map(
    source.site.images.map((image) => [image.id, image]),
  );
  const publicAssetIds = new Set([
    ...source.site.images.map((asset) => asset.id),
    ...source.site.resumeAssets.map((asset) => asset.id),
  ]);

  const publishedResumeAssets = source.site.resumeAssets.filter(
    (asset) => asset.publicationStatus === "published",
  );
  if (publishedResumeAssets.length > 1) {
    for (const asset of publishedResumeAssets) {
      add(
        "ResumeAsset",
        asset.id,
        "site.resumeAssets",
        "only one resume asset may be published",
      );
    }
  }

  const profileImage = source.site.profileImage;
  if (profileImage !== undefined) {
    checkUniqueReferences(
      profileImage.mainAssetIds,
      "ProfileImage",
      profileImage.id,
      "site.profileImage.mainAssetIds",
    );
    checkUniqueReferences(
      profileImage.compactAssetIds,
      "ProfileImage",
      profileImage.id,
      "site.profileImage.compactAssetIds",
    );
    checkUniqueReferences(
      [...profileImage.mainAssetIds, ...profileImage.compactAssetIds],
      "ProfileImage",
      profileImage.id,
      "site.profileImage.assetIds",
    );

    const checkProfileAsset = (
      assetId: string,
      index: number,
      kind: "main" | "compact",
    ) => {
      const asset = imageById.get(assetId);
      const fieldPath = `site.profileImage.${kind}AssetIds.${String(index)}`;

      if (asset === undefined) {
        add(
          "ProfileImage",
          profileImage.id,
          fieldPath,
          "references an unknown image asset",
        );
      } else if (asset.publicationStatus !== "published") {
        add(
          "ProfileImage",
          profileImage.id,
          fieldPath,
          "references an image that is not published",
        );
      } else if (kind === "main" && asset.decorative) {
        add(
          "ProfileImage",
          profileImage.id,
          fieldPath,
          "main portrait assets must provide meaningful alternative text",
        );
      } else if (kind === "compact" && !asset.decorative) {
        add(
          "ProfileImage",
          profileImage.id,
          fieldPath,
          "compact identity assets must be decorative",
        );
      }
    };

    profileImage.mainAssetIds.forEach((assetId, index) => {
      checkProfileAsset(assetId, index, "main");
    });
    profileImage.compactAssetIds.forEach((assetId, index) => {
      checkProfileAsset(assetId, index, "compact");
    });
  }

  source.professional.experiences.forEach((experience, experienceIndex) => {
    experience.roles.forEach((role, roleIndex) => {
      role.technologyIds.forEach((skillId, skillIndex) => {
        if (!skillIds.has(skillId)) {
          add(
            "ExperienceRole",
            role.id,
            `professional.experiences.${String(experienceIndex)}.roles.${String(roleIndex)}.technologyIds.${String(skillIndex)}`,
            "references an unknown skill",
          );
        }
      });
    });
  });

  const skillCategoryOwners = new Map<string, string>();
  const skillReferenceCounts = new Map<string, number>();
  source.professional.skillGroups.forEach((group, groupIndex) => {
    const categoryOwner = skillCategoryOwners.get(group.category);
    if (categoryOwner !== undefined) {
      add(
        "SkillGroup",
        group.id,
        `professional.skillGroups.${String(groupIndex)}.category`,
        `duplicates category already used by ${categoryOwner}`,
      );
    } else {
      skillCategoryOwners.set(group.category, group.id);
    }

    const references = group.skills.map((reference) => reference.skillId);
    checkUniqueReferences(
      references,
      "SkillGroup",
      group.id,
      `professional.skillGroups.${String(groupIndex)}.skills`,
    );
    group.skills.forEach((reference, referenceIndex) => {
      skillReferenceCounts.set(
        reference.skillId,
        (skillReferenceCounts.get(reference.skillId) ?? 0) + 1,
      );
      if (!skillIds.has(reference.skillId)) {
        add(
          "SkillGroup",
          group.id,
          `professional.skillGroups.${String(groupIndex)}.skills.${String(referenceIndex)}.skillId`,
          "references an unknown skill",
        );
      }
    });
  });
  source.professional.skills.forEach((skill, skillIndex) => {
    const referenceCount = skillReferenceCounts.get(skill.id) ?? 0;
    if (referenceCount !== 1) {
      add(
        "Skill",
        skill.id,
        `professional.skills.${String(skillIndex)}.id`,
        referenceCount === 0
          ? "must appear in exactly one public skill group"
          : "appears in more than one public skill group",
      );
    }
  });

  source.professional.credibilityHighlights.forEach(
    (highlight, highlightIndex) => {
      checkUniqueReferences(
        highlight.supportingClaimIds,
        "CredibilityHighlight",
        highlight.id,
        `professional.credibilityHighlights.${String(highlightIndex)}.supportingClaimIds`,
      );
      highlight.supportingClaimIds.forEach((claimId, claimIndex) => {
        if (!claimIds.has(claimId)) {
          add(
            "CredibilityHighlight",
            highlight.id,
            `professional.credibilityHighlights.${String(highlightIndex)}.supportingClaimIds.${String(claimIndex)}`,
            "references an unknown experience claim",
          );
        }
      });
    },
  );

  const checkImageReference = (
    imageId: string | undefined,
    recordType: string,
    recordId: string,
    fieldPath: string,
    requirePublished = true,
  ) => {
    if (imageId === undefined) return;
    const image = imageById.get(imageId);
    if (image === undefined) {
      add(recordType, recordId, fieldPath, "references an unknown image asset");
    } else if (requirePublished && image.publicationStatus !== "published") {
      add(
        recordType,
        recordId,
        fieldPath,
        "references an image that is not published",
      );
    }
  };

  checkImageReference(
    source.site.seo.home.socialImageAssetId,
    "SeoDefaults",
    source.site.seo.id,
    "site.seo.home.socialImageAssetId",
  );
  checkImageReference(
    source.site.seo.projects.socialImageAssetId,
    "SeoDefaults",
    source.site.seo.id,
    "site.seo.projects.socialImageAssetId",
  );
  checkImageReference(
    source.site.seo.writings.socialImageAssetId,
    "SeoDefaults",
    source.site.seo.id,
    "site.seo.writings.socialImageAssetId",
  );

  source.projects.forEach((project, projectIndex) => {
    checkUniqueLabels(
      project.plannedStack,
      "Project",
      project.id,
      `projects.${String(projectIndex)}.plannedStack`,
    );
    checkUniqueLabels(
      project.homeStack,
      "Project",
      project.id,
      `projects.${String(projectIndex)}.homeStack`,
    );

    if (project.seo.canonicalPath !== `/projects/${project.slug}`) {
      add(
        "Project",
        project.id,
        `projects.${String(projectIndex)}.seo.canonicalPath`,
        "must match the project slug beneath /projects/",
      );
    }

    const plannedStack = new Set(project.plannedStack);
    project.homeStack.forEach((technology, technologyIndex) => {
      if (!plannedStack.has(technology)) {
        add(
          "Project",
          project.id,
          `projects.${String(projectIndex)}.homeStack.${String(technologyIndex)}`,
          "must also appear in the complete planned stack",
        );
      }
    });

    if (project.plannedShortLinkPattern !== undefined) {
      const expectedPrefix = `${project.plannedDestination}/`;
      const placeholderCount =
        project.plannedShortLinkPattern.split("{id}").length - 1;
      if (
        !project.plannedShortLinkPattern.startsWith(expectedPrefix) ||
        placeholderCount !== 1
      ) {
        add(
          "Project",
          project.id,
          `projects.${String(projectIndex)}.plannedShortLinkPattern`,
          "must begin with the planned destination and contain one {id} placeholder",
        );
      }
    }

    checkImageReference(
      project.seo.socialImageAssetId,
      "Project",
      project.id,
      `projects.${String(projectIndex)}.seo.socialImageAssetId`,
      project.publicationStatus === "published",
    );
  });

  source.writings.forEach((writing, writingIndex) => {
    const metadata = writing.metadata;

    if (
      metadata.publicationStatus === "published" &&
      !hasPublishedWritingFields(writing)
    ) {
      add(
        "Writing",
        metadata.id,
        `writings.${String(writingIndex)}`,
        "published writings require summary, full publication date, SEO, and article content",
      );
    }

    if (
      metadata.seo !== undefined &&
      metadata.seo.canonicalPath !== `/writings/${metadata.slug}`
    ) {
      add(
        "Writing",
        metadata.id,
        `writings.${String(writingIndex)}.metadata.seo.canonicalPath`,
        "must match the writing slug beneath /writings/",
      );
    }

    if (
      metadata.publishedOn !== undefined &&
      metadata.updatedOn !== undefined &&
      metadata.updatedOn < metadata.publishedOn
    ) {
      add(
        "Writing",
        metadata.id,
        `writings.${String(writingIndex)}.metadata.updatedOn`,
        "updatedOn precedes publishedOn",
      );
    }

    checkUniqueReferences(
      metadata.tags,
      "Writing",
      metadata.id,
      `writings.${String(writingIndex)}.metadata.tags`,
    );
    checkImageReference(
      metadata.coverImageAssetId,
      "Writing",
      metadata.id,
      `writings.${String(writingIndex)}.metadata.coverImageAssetId`,
      metadata.publicationStatus === "published",
    );
    checkImageReference(
      metadata.seo?.socialImageAssetId,
      "Writing",
      metadata.id,
      `writings.${String(writingIndex)}.metadata.seo.socialImageAssetId`,
      metadata.publicationStatus === "published",
    );
  });

  const manifestByAssetId = new Map<string, BuildAssetManifestEntry>();
  assetManifest.forEach((entry, index) => {
    if (manifestByAssetId.has(entry.assetId)) {
      add(
        "BuildAssetManifest",
        entry.assetId,
        `assetManifest.${String(index)}.assetId`,
        "duplicates a build asset manifest entry",
      );
    } else {
      manifestByAssetId.set(entry.assetId, entry);
    }

    if (!publicAssetIds.has(entry.assetId)) {
      add(
        "BuildAssetManifest",
        entry.assetId,
        `assetManifest.${String(index)}.assetId`,
        "does not correspond to a public asset record",
      );
    }
  });

  const checkOrganizationLogoReference = (
    assetId: string,
    expectedUse: "experience-employer-logo" | "education-institution-logo",
    recordType: "Experience" | "Education",
    recordId: string,
    fieldPath: string,
  ) => {
    const asset = imageById.get(assetId);
    const manifest = manifestByAssetId.get(assetId);

    if (asset === undefined) {
      add(recordType, recordId, fieldPath, "references an unknown logo asset");
      return;
    }
    if (asset.publicationStatus !== "published") {
      add(
        recordType,
        recordId,
        fieldPath,
        "references a logo asset that is not published",
      );
    }
    if (
      !asset.path.startsWith("/assets/organizations/") ||
      !asset.decorative ||
      asset.altText !== ""
    ) {
      add(
        recordType,
        recordId,
        fieldPath,
        "organization logos must be decorative assets beneath /assets/organizations/",
      );
    }
    if (manifest === undefined || !("intendedUse" in manifest)) {
      add(
        recordType,
        recordId,
        fieldPath,
        "logo is missing its organization asset governance record",
      );
      return;
    }
    if (manifest.intendedUse !== expectedUse) {
      add(
        recordType,
        recordId,
        fieldPath,
        `logo is governed for ${manifest.intendedUse} instead of ${expectedUse}`,
      );
    }
    if (
      manifest.sourcePath !== `chat-attachment:${manifest.originalFilename}` ||
      manifest.publicDerivativePath !== asset.path ||
      manifest.publicDerivativeMediaType !== asset.mediaType ||
      manifest.publicDerivativeWidth !== asset.width ||
      manifest.publicDerivativeHeight !== asset.height ||
      manifest.publicDerivativeByteSize !== manifest.byteSize ||
      manifest.publicDerivativeSha256 !== manifest.sha256
    ) {
      add(
        "BuildAssetManifest",
        assetId,
        fieldPath,
        "organization logo governance does not match its public derivative",
      );
    }
    if (
      manifest.metadataInspection.metadataPresentAtIntake !==
      manifest.metadataInspection.metadataRemovalRequired
    ) {
      add(
        "BuildAssetManifest",
        assetId,
        fieldPath,
        "metadata-removal evidence is inconsistent with intake inspection",
      );
    }
  };

  source.professional.experiences.forEach((experience, experienceIndex) => {
    checkOrganizationLogoReference(
      experience.logoAssetId,
      "experience-employer-logo",
      "Experience",
      experience.id,
      `professional.experiences.${String(experienceIndex)}.logoAssetId`,
    );
  });
  source.professional.education.forEach((education, educationIndex) => {
    checkOrganizationLogoReference(
      education.logoAssetId,
      "education-institution-logo",
      "Education",
      education.id,
      `professional.education.${String(educationIndex)}.logoAssetId`,
    );
  });

  [...source.site.resumeAssets, ...source.site.images].forEach(
    (asset, index) => {
      const manifest = manifestByAssetId.get(asset.id);
      if (manifest === undefined) {
        add(
          asset.mediaType === "application/pdf" ? "ResumeAsset" : "ImageAsset",
          asset.id,
          `site.assets.${String(index)}`,
          "is missing its separate build asset manifest entry",
        );
      } else {
        if (
          asset.publicationStatus === "published" &&
          !manifest.metadataRemovalVerified
        ) {
          add(
            asset.mediaType === "application/pdf"
              ? "ResumeAsset"
              : "ImageAsset",
            asset.id,
            `assetManifest.${String(index)}.metadataRemovalVerified`,
            "must verify metadata removal before an asset is published",
          );
        }

        if (asset.mediaType === "application/pdf") {
          if (manifest.pageCount === undefined) {
            add(
              "ResumeAsset",
              asset.id,
              `assetManifest.${String(index)}.pageCount`,
              "must record the verified PDF page count",
            );
          }
          if (manifest.linkCount === undefined) {
            add(
              "ResumeAsset",
              asset.id,
              `assetManifest.${String(index)}.linkCount`,
              "must record the verified PDF link count",
            );
          }
          if (
            asset.publicationStatus === "published" &&
            manifest.linkValidationVerified !== true
          ) {
            add(
              "ResumeAsset",
              asset.id,
              `assetManifest.${String(index)}.linkValidationVerified`,
              "must verify PDF links before the asset is published",
            );
          }
        }
      }
    },
  );

  return diagnostics;
}

export function validateContent(
  input: unknown,
  assetManifestInput: unknown = [],
): ValidatedContentSnapshot {
  const sourceResult = localContentSourceSchema.safeParse(input);
  const manifestResult = buildAssetManifestEntrySchema
    .array()
    .readonly()
    .safeParse(assetManifestInput);
  const diagnostics: ContentDiagnostic[] = [];

  if (!sourceResult.success) {
    diagnostics.push(
      ...sourceResult.error.issues.map((issue) =>
        diagnosticFromIssue(issue, input),
      ),
    );
  }

  if (!manifestResult.success) {
    diagnostics.push(
      ...manifestResult.error.issues.map((issue) =>
        diagnosticFromIssue(
          { ...issue, path: ["assetManifest", ...issue.path] },
          { assetManifest: assetManifestInput },
        ),
      ),
    );
  }

  if (!sourceResult.success || !manifestResult.success) {
    throw new ContentValidationError(diagnostics);
  }

  const source: LocalContentSource = sourceResult.data;
  const assetManifest: readonly BuildAssetManifestEntry[] = manifestResult.data;
  diagnostics.push(...validateCrossRecordRules(source, assetManifest));

  if (diagnostics.length > 0) {
    throw new ContentValidationError(diagnostics);
  }

  return {
    site: source.site,
    professional: source.professional,
    projects: source.projects,
    writings: source.writings.map(writingProjection),
  };
}
