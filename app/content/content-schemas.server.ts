import { z } from "zod";

import type {
  ContactLink,
  CredibilityHighlight,
  DateRange,
  Education,
  Experience,
  ExperienceRole,
  InternalPath,
  LocalContentSource,
  OrderedSkillReference,
  OrderedStatement,
  ProfileImageSource,
  ProfessionalContentSource,
  ProjectRecord,
  ProvisionalArticleContent,
  PublicImageAsset,
  PublicLink,
  PublicResumeAsset,
  SeoDefaults,
  SeoMetadata,
  SiteContentSource,
  SiteIdentitySource,
  Skill,
  SkillGroup,
  SocialLink,
  WritingMetadata,
  WritingRecord,
} from "../domain/content";

const stableIdPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const partialDatePattern = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;
const fullDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const encodedUnsafePathPattern = /%(?:2e|2f|5c)/i;
const dotTraversalPattern = /(?:^|\/)\.{1,2}(?:\/|$)/;

function isTrimmedNonempty(value: string) {
  return value.length > 0 && value === value.trim();
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isCalendarDate(value: string) {
  if (!partialDatePattern.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);

  if (!Number.isInteger(year) || year < 1) {
    return false;
  }

  if (monthText === undefined) {
    return true;
  }

  const month = Number(monthText);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return false;
  }

  if (dayText === undefined) {
    return true;
  }

  const day = Number(dayText);
  const daysByMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  const daysInMonth = daysByMonth[month - 1];

  return (
    daysInMonth !== undefined &&
    Number.isInteger(day) &&
    day >= 1 &&
    day <= daysInMonth
  );
}

function isSafeHttpsUrl(value: string) {
  if (
    !isTrimmedNonempty(value) ||
    !value.startsWith("https://") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    dotTraversalPattern.test(value) ||
    encodedUnsafePathPattern.test(value)
  ) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && url.username === "" && url.password === ""
    );
  } catch {
    return false;
  }
}

function isInternalPath(value: unknown): value is InternalPath {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.slice(1).includes("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    encodedUnsafePathPattern.test(value)
  ) {
    return false;
  }

  const segments = value.split("/");

  if (segments.some((segment) => segment === "." || segment === "..")) {
    return false;
  }

  try {
    const url = new URL(value, "https://internal.invalid");
    return (
      url.origin === "https://internal.invalid" &&
      url.pathname === value &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

function isMailto(value: string) {
  if (
    !value.startsWith("mailto:") ||
    value.includes("?") ||
    value.includes("#")
  ) {
    return false;
  }

  return z.email().safeParse(value.slice("mailto:".length)).success;
}

function isTelephone(value: string) {
  return /^tel:\+[1-9]\d{7,14}$/.test(value);
}

export const nonemptyTextSchema = z
  .string()
  .refine(isTrimmedNonempty, "must be nonempty and have no outer whitespace");

export const stableIdSchema = nonemptyTextSchema.regex(
  stableIdPattern,
  "must be a lowercase kebab-case stable ID",
);

export const slugSchema = nonemptyTextSchema
  .max(100)
  .regex(slugPattern, "must be a URL-safe lowercase kebab-case slug");

export const positiveOrderSchema = z
  .number()
  .int()
  .positive("must be a positive integer");

export const partialDateSchema = z
  .string()
  .regex(partialDatePattern, "must use YYYY, YYYY-MM, or YYYY-MM-DD")
  .refine(isCalendarDate, "must be a valid calendar date");

export const fullDateSchema = z
  .string()
  .regex(fullDatePattern, "must use YYYY-MM-DD")
  .refine(isCalendarDate, "must be a valid calendar date");

export const httpsUrlSchema = z
  .string()
  .refine(isSafeHttpsUrl, "must be a safe HTTPS URL without credentials");

export const internalPathSchema = z.custom<InternalPath>(isInternalPath, {
  error:
    "must be a normalized root-relative path without traversal, host, scheme, query, or fragment",
});

export const assetHashSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 hash");

export const publicImageMediaTypeSchema = z.enum([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const dateRangeSchema = z
  .object({
    start: partialDateSchema,
    end: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("date"), value: partialDateSchema }),
      z.object({ kind: z.literal("present") }),
    ]),
  })
  .superRefine((range, context) => {
    if (range.end.kind === "present") return;

    const bounds = comparePartialDates(range.start, range.end.value);
    if (bounds.rightLatest < bounds.leftEarliest) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "end date precedes start date",
      });
    }
  }) satisfies z.ZodType<DateRange>;

const orderedStatementSchema = z.object({
  id: stableIdSchema,
  order: positiveOrderSchema,
  text: nonemptyTextSchema,
}) satisfies z.ZodType<OrderedStatement>;

const seoMetadataSchema = z.object({
  title: nonemptyTextSchema,
  description: nonemptyTextSchema,
  canonicalPath: internalPathSchema,
  socialImageAssetId: stableIdSchema.optional(),
}) satisfies z.ZodType<SeoMetadata>;

const siteIdentitySchema = z.object({
  id: stableIdSchema,
  displayName: nonemptyTextSchema,
  roleLabel: nonemptyTextSchema,
  location: nonemptyTextSchema,
  professionalPositioning: nonemptyTextSchema,
  introduction: nonemptyTextSchema,
  opportunityStatement: nonemptyTextSchema,
  careerStart: partialDateSchema,
  locale: nonemptyTextSchema,
}) satisfies z.ZodType<SiteIdentitySource>;

const seoDefaultsSchema = z.object({
  id: stableIdSchema,
  siteName: nonemptyTextSchema,
  canonicalOrigin: httpsUrlSchema.refine((value) => {
    const url = new URL(value);
    return url.pathname === "/" && url.search === "" && url.hash === "";
  }, "must be an HTTPS origin without a path, query, or fragment"),
  titleTemplate: nonemptyTextSchema.refine(
    (value) => value.includes("%s"),
    "must include the %s title placeholder",
  ),
  home: seoMetadataSchema,
  projects: seoMetadataSchema,
  writings: seoMetadataSchema,
}) satisfies z.ZodType<SeoDefaults>;

const contactLinkSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(["email", "phone"]),
    label: nonemptyTextSchema,
    href: nonemptyTextSchema,
    order: positiveOrderSchema,
  })
  .superRefine((contact, context) => {
    const valid =
      contact.kind === "email"
        ? isMailto(contact.href)
        : isTelephone(contact.href);

    if (!valid) {
      context.addIssue({
        code: "custom",
        path: ["href"],
        message:
          contact.kind === "email"
            ? "must be an approved mailto link with a valid address"
            : "must be an approved E.164 tel link",
      });
    }
  }) satisfies z.ZodType<ContactLink>;

const socialLinkSchema = z.object({
  id: stableIdSchema,
  platform: stableIdSchema,
  label: nonemptyTextSchema,
  url: httpsUrlSchema,
  order: positiveOrderSchema,
}) satisfies z.ZodType<SocialLink>;

const customerEngagementSchema = z.object({
  relationship: z.literal("customer"),
  organization: nonemptyTextSchema,
});

const experienceRoleSchema = z.object({
  id: stableIdSchema,
  title: nonemptyTextSchema,
  dates: dateRangeSchema,
  location: nonemptyTextSchema,
  engagement: customerEngagementSchema.optional(),
  summary: nonemptyTextSchema,
  responsibilities: z.array(orderedStatementSchema).readonly(),
  technologyIds: z.array(stableIdSchema).readonly(),
  order: positiveOrderSchema,
}) satisfies z.ZodType<ExperienceRole>;

const experienceSchema = z.object({
  id: stableIdSchema,
  organization: nonemptyTextSchema,
  logoAssetId: stableIdSchema,
  roles: z.array(experienceRoleSchema).min(1).readonly(),
  order: positiveOrderSchema,
  featured: z.boolean(),
}) satisfies z.ZodType<Experience>;

const credibilityHighlightSchema = z.object({
  id: stableIdSchema,
  lead: nonemptyTextSchema,
  detail: nonemptyTextSchema,
  supportingClaimIds: z.array(stableIdSchema).min(1).readonly(),
  order: positiveOrderSchema,
}) satisfies z.ZodType<CredibilityHighlight>;

const skillSchema = z.object({
  id: stableIdSchema,
  name: nonemptyTextSchema,
}) satisfies z.ZodType<Skill>;

const orderedSkillReferenceSchema = z.object({
  skillId: stableIdSchema,
  order: positiveOrderSchema,
}) satisfies z.ZodType<OrderedSkillReference>;

const skillGroupSchema = z.object({
  id: stableIdSchema,
  category: z.enum([
    "languages",
    "backend",
    "frontend",
    "data",
    "cloud",
    "tooling",
  ]),
  name: nonemptyTextSchema,
  skills: z.array(orderedSkillReferenceSchema).min(1).readonly(),
  order: positiveOrderSchema,
}) satisfies z.ZodType<SkillGroup>;

const educationSchema = z.object({
  id: stableIdSchema,
  institution: nonemptyTextSchema,
  credential: nonemptyTextSchema,
  fieldOfStudy: nonemptyTextSchema,
  dates: dateRangeSchema,
  score: nonemptyTextSchema.optional(),
  logoAssetId: stableIdSchema,
  order: positiveOrderSchema,
}) satisfies z.ZodType<Education>;

const publicLinkSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(["internal", "external", "live", "source"]),
    label: nonemptyTextSchema,
    href: nonemptyTextSchema,
    order: positiveOrderSchema,
  })
  .superRefine((link, context) => {
    const valid =
      link.kind === "internal"
        ? isInternalPath(link.href)
        : isSafeHttpsUrl(link.href);

    if (!valid) {
      context.addIssue({
        code: "custom",
        path: ["href"],
        message:
          link.kind === "internal"
            ? "must be a safe root-relative internal path"
            : "must be a safe HTTPS URL without credentials",
      });
    }
  }) satisfies z.ZodType<PublicLink>;

const publicationStatusSchema = z.enum(["draft", "published", "archived"]);

const projectRecordSchema = z.object({
  id: stableIdSchema,
  slug: slugSchema,
  title: nonemptyTextSchema,
  publicationStatus: publicationStatusSchema,
  projectStatus: nonemptyTextSchema.optional(),
  summary: nonemptyTextSchema.optional(),
  problem: nonemptyTextSchema.optional(),
  role: nonemptyTextSchema.optional(),
  approach: nonemptyTextSchema.optional(),
  architecture: nonemptyTextSchema.optional(),
  order: positiveOrderSchema.optional(),
  featuredOrder: positiveOrderSchema.optional(),
  decisions: z.array(orderedStatementSchema).readonly(),
  outcomes: z.array(orderedStatementSchema).readonly(),
  technologyIds: z.array(stableIdSchema).readonly(),
  links: z.array(publicLinkSchema).readonly(),
  imageAssetIds: z.array(stableIdSchema).readonly(),
  relatedProjectIds: z.array(stableIdSchema).readonly(),
  seo: seoMetadataSchema.optional(),
}) satisfies z.ZodType<ProjectRecord>;

const provisionalArticleContentSchema = z.object({
  format: z.literal("provisional"),
  text: nonemptyTextSchema,
}) satisfies z.ZodType<ProvisionalArticleContent>;

const writingMetadataSchema = z.object({
  id: stableIdSchema,
  slug: slugSchema,
  title: nonemptyTextSchema,
  publicationStatus: publicationStatusSchema,
  summary: nonemptyTextSchema.optional(),
  publishedOn: fullDateSchema.optional(),
  updatedOn: fullDateSchema.optional(),
  tags: z.array(nonemptyTextSchema).readonly(),
  featuredOrder: positiveOrderSchema.optional(),
  coverImageAssetId: stableIdSchema.optional(),
  seo: seoMetadataSchema.optional(),
}) satisfies z.ZodType<WritingMetadata>;

const writingRecordSchema = z.object({
  metadata: writingMetadataSchema,
  article: provisionalArticleContentSchema.optional(),
}) satisfies z.ZodType<WritingRecord>;

const publicResumeAssetSchema = z.object({
  id: stableIdSchema,
  publicationStatus: publicationStatusSchema,
  title: nonemptyTextSchema,
  path: internalPathSchema.refine(
    (path) => path.startsWith("/assets/") && path.endsWith(".pdf"),
    "must be a local PDF path beneath /assets/",
  ),
  mediaType: z.literal("application/pdf"),
  downloadName: nonemptyTextSchema.refine(
    (name) =>
      name.endsWith(".pdf") && !name.includes("/") && !name.includes("\\"),
    "must be a safe PDF download filename",
  ),
}) satisfies z.ZodType<PublicResumeAsset>;

const publicImageAssetSchema = z
  .object({
    id: stableIdSchema,
    publicationStatus: publicationStatusSchema,
    path: internalPathSchema.refine(
      (path) => path.startsWith("/assets/"),
      "must be a local image path beneath /assets/",
    ),
    mediaType: publicImageMediaTypeSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    decorative: z.boolean(),
    altText: z.string(),
  })
  .superRefine((image, context) => {
    const validExtensions = {
      "image/avif": [".avif"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    }[image.mediaType];

    if (!validExtensions.some((extension) => image.path.endsWith(extension))) {
      context.addIssue({
        code: "custom",
        path: ["path"],
        message: "file extension must match the declared image media type",
      });
    }

    if (image.decorative && image.altText !== "") {
      context.addIssue({
        code: "custom",
        path: ["altText"],
        message: "must be empty for a decorative image",
      });
    }

    if (!image.decorative && !isTrimmedNonempty(image.altText)) {
      context.addIssue({
        code: "custom",
        path: ["altText"],
        message: "must describe a non-decorative image",
      });
    }
  }) satisfies z.ZodType<PublicImageAsset>;

const profileImageSourceSchema = z.object({
  id: stableIdSchema,
  mainAssetIds: z.array(stableIdSchema).min(1).readonly(),
  compactAssetIds: z.array(stableIdSchema).min(1).readonly(),
}) satisfies z.ZodType<ProfileImageSource>;

const siteContentSourceSchema = z.object({
  identity: siteIdentitySchema,
  seo: seoDefaultsSchema,
  contacts: z.array(contactLinkSchema).readonly(),
  socialLinks: z.array(socialLinkSchema).readonly(),
  resumeAssets: z.array(publicResumeAssetSchema).readonly(),
  images: z.array(publicImageAssetSchema).readonly(),
  profileImage: profileImageSourceSchema.optional(),
}) satisfies z.ZodType<SiteContentSource>;

const professionalContentSourceSchema = z.object({
  experiences: z.array(experienceSchema).readonly(),
  credibilityHighlights: z.array(credibilityHighlightSchema).readonly(),
  skills: z.array(skillSchema).readonly(),
  skillGroups: z.array(skillGroupSchema).readonly(),
  education: z.array(educationSchema).readonly(),
}) satisfies z.ZodType<ProfessionalContentSource>;

export const localContentSourceSchema = z.object({
  site: siteContentSourceSchema,
  professional: professionalContentSourceSchema,
  projects: z.array(projectRecordSchema).readonly(),
  writings: z.array(writingRecordSchema).readonly(),
}) satisfies z.ZodType<LocalContentSource>;

const baseBuildAssetManifestEntrySchema = z.object({
  assetId: stableIdSchema,
  sourcePath: nonemptyTextSchema,
  sha256: assetHashSchema,
  byteSize: z.number().int().positive(),
  metadataRemovalVerified: z.boolean(),
  pageCount: z.number().int().positive().optional(),
  linkCount: z.number().int().nonnegative().optional(),
  linkValidationVerified: z.boolean().optional(),
  approvedOn: fullDateSchema,
});

const organizationLogoManifestEntrySchema =
  baseBuildAssetManifestEntrySchema.extend({
    originalFilename: nonemptyTextSchema.refine(
      (name) => !name.includes("/") && !name.includes("\\"),
      "must be a filename without path separators",
    ),
    intakeMediaType: publicImageMediaTypeSchema,
    intakeWidth: z.number().int().positive(),
    intakeHeight: z.number().int().positive(),
    intakeByteSize: z.number().int().positive(),
    intakeSha256: assetHashSchema,
    publicDerivativePath: internalPathSchema.refine(
      (path) => path.startsWith("/assets/organizations/"),
      "must be a local organization asset path",
    ),
    publicDerivativeMediaType: publicImageMediaTypeSchema,
    publicDerivativeWidth: z.number().int().positive(),
    publicDerivativeHeight: z.number().int().positive(),
    publicDerivativeByteSize: z.number().int().positive(),
    publicDerivativeSha256: assetHashSchema,
    metadataInspection: z.object({
      decoderVerified: z.literal(true),
      frameCount: z.literal(1),
      metadataPresentAtIntake: z.boolean(),
      metadataRemovalRequired: z.boolean(),
      pixelEquivalenceVerified: z.literal(true),
      trailingPayloadBytes: z.literal(0),
    }),
    intendedUse: z.enum([
      "experience-employer-logo",
      "education-institution-logo",
    ]),
  });

export const buildAssetManifestEntrySchema = z.union([
  organizationLogoManifestEntrySchema.strict(),
  baseBuildAssetManifestEntrySchema.strict(),
]);

export type BuildAssetManifestEntry = z.output<
  typeof buildAssetManifestEntrySchema
>;

export function comparePartialDates(left: string, right: string) {
  const earliest = (value: string) =>
    `${value}${value.length === 4 ? "-01-01" : value.length === 7 ? "-01" : ""}`;
  const latest = (value: string) => {
    if (value.length === 4) {
      return `${value}-12-31`;
    }

    if (value.length === 7) {
      const [yearText, monthText] = value.split("-");
      const year = Number(yearText);
      const month = Number(monthText);
      const daysByMonth = [
        31,
        isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      return `${value}-${String(daysByMonth[month - 1]).padStart(2, "0")}`;
    }

    return value;
  };

  return {
    leftEarliest: earliest(left),
    leftLatest: latest(left),
    rightEarliest: earliest(right),
    rightLatest: latest(right),
  };
}
