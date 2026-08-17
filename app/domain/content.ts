export type StableId = string;
export type Slug = string;
export type InternalPath = `/${string}`;
export type PartialDate = string;
export type FullDate = string;

export interface DateRange {
  readonly start: PartialDate;
  readonly end:
    | { readonly kind: "date"; readonly value: PartialDate }
    | { readonly kind: "present" };
}

export interface OrderedStatement {
  readonly id: StableId;
  readonly order: number;
  readonly text: string;
}

export interface SeoMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: InternalPath;
  readonly socialImageAssetId?: StableId | undefined;
}

export interface SiteIdentitySource {
  readonly id: StableId;
  readonly displayName: string;
  readonly roleLabel: string;
  readonly location: string;
  readonly professionalPositioning: string;
  readonly introduction: string;
  readonly opportunityStatement: string;
  readonly careerStart: PartialDate;
  readonly locale: string;
}

export interface SiteIdentity extends SiteIdentitySource {
  readonly approximateYearsExperience: number;
}

export interface SeoDefaults {
  readonly id: StableId;
  readonly siteName: string;
  readonly canonicalOrigin: string;
  readonly titleTemplate: string;
  readonly home: SeoMetadata;
  readonly projects: SeoMetadata;
  readonly writings: SeoMetadata;
}

export interface ContactLink {
  readonly id: StableId;
  readonly kind: "email" | "phone";
  readonly label: string;
  readonly href: string;
  readonly order: number;
}

export interface SocialLink {
  readonly id: StableId;
  readonly platform: string;
  readonly label: string;
  readonly url: string;
  readonly order: number;
}

export interface CustomerEngagement {
  readonly relationship: "customer";
  readonly organization: string;
}

export interface ExperienceRole {
  readonly id: StableId;
  readonly title: string;
  readonly dates: DateRange;
  readonly location: string;
  readonly engagement?: CustomerEngagement | undefined;
  readonly summary: string;
  readonly responsibilities: readonly OrderedStatement[];
  readonly technologyIds: readonly StableId[];
  readonly order: number;
}

export interface Experience {
  readonly id: StableId;
  readonly organization: string;
  readonly logoAssetId: StableId;
  readonly roles: readonly ExperienceRole[];
  readonly order: number;
  readonly featured: boolean;
}

export interface CredibilityHighlight {
  readonly id: StableId;
  readonly lead: string;
  readonly detail: string;
  readonly supportingClaimIds: readonly StableId[];
  readonly order: number;
}

export interface Skill {
  readonly id: StableId;
  readonly name: string;
}

export interface OrderedSkillReference {
  readonly skillId: StableId;
  readonly order: number;
}

export type SkillGroupCategory =
  "languages" | "backend" | "frontend" | "data" | "cloud" | "tooling";

export interface SkillGroup {
  readonly id: StableId;
  readonly category: SkillGroupCategory;
  readonly name: string;
  readonly skills: readonly OrderedSkillReference[];
  readonly order: number;
}

export interface ResolvedSkillGroup {
  readonly id: StableId;
  readonly category: SkillGroupCategory;
  readonly name: string;
  readonly skills: readonly Skill[];
  readonly order: number;
}

export interface Education {
  readonly id: StableId;
  readonly institution: string;
  readonly credential: string;
  readonly fieldOfStudy: string;
  readonly dates: DateRange;
  readonly score?: string | undefined;
  readonly logoAssetId: StableId;
  readonly order: number;
}

export type PublicationStatus = "draft" | "published" | "archived";

export type ProjectStatus = "wip" | "beta" | "live";

export const PROJECT_SLUG = {
  tourney: "tourney",
  urlShortener: "url-shortener",
  portfolioTracker: "portfolio-tracker",
  universalJobTracker: "universal-job-tracker",
} as const;

export const PROJECT_SLUGS = [
  PROJECT_SLUG.tourney,
  PROJECT_SLUG.urlShortener,
  PROJECT_SLUG.portfolioTracker,
  PROJECT_SLUG.universalJobTracker,
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];
export type ProjectMarkId = ProjectSlug;

export function isProjectSlug(value: string | undefined): value is ProjectSlug {
  return PROJECT_SLUGS.some((slug) => slug === value);
}

interface ProjectFields {
  readonly id: StableId;
  readonly slug: Slug;
  readonly name: string;
  readonly summary: string;
  readonly status: ProjectStatus;
  readonly order: number;
  readonly plannedDestination: string;
  readonly plannedShortLinkPattern?: string | undefined;
  readonly plannedCapabilities: readonly OrderedStatement[];
  readonly plannedStack: readonly string[];
  readonly homeStack: readonly string[];
  readonly stackRationale: string;
  readonly laterPossibilities: readonly OrderedStatement[];
  readonly disclaimer?: string | undefined;
  readonly featuredOnHome: boolean;
  readonly projectMark: ProjectMarkId;
  readonly seo: SeoMetadata;
}

export interface PublishedProject extends ProjectFields {
  readonly publicationStatus: "published";
}

export interface UnpublishedProject extends ProjectFields {
  readonly publicationStatus: "draft" | "archived";
}

export type ProjectRecord = PublishedProject | UnpublishedProject;

export interface ProvisionalArticleContent {
  readonly format: "provisional";
  readonly text: string;
}

export interface WritingMetadata {
  readonly id: StableId;
  readonly slug: Slug;
  readonly title: string;
  readonly publicationStatus: PublicationStatus;
  readonly summary?: string | undefined;
  readonly publishedOn?: FullDate | undefined;
  readonly updatedOn?: FullDate | undefined;
  readonly tags: readonly string[];
  readonly featuredOrder?: number | undefined;
  readonly coverImageAssetId?: StableId | undefined;
  readonly seo?: SeoMetadata | undefined;
}

export interface WritingRecord {
  readonly metadata: WritingMetadata;
  readonly article?: ProvisionalArticleContent | undefined;
}

export interface PublishedWriting extends WritingRecord {
  readonly metadata: WritingMetadata & {
    readonly publicationStatus: "published";
    readonly summary: string;
    readonly publishedOn: FullDate;
    readonly seo: SeoMetadata;
  };
  readonly article: ProvisionalArticleContent;
}

export interface UnpublishedWriting extends WritingRecord {
  readonly metadata: WritingMetadata & {
    readonly publicationStatus: "draft" | "archived";
  };
}

export interface PublicResumeAsset {
  readonly id: StableId;
  readonly publicationStatus: PublicationStatus;
  readonly title: string;
  readonly path: InternalPath;
  readonly mediaType: "application/pdf";
  readonly downloadName: string;
}

export interface PublicImageAsset {
  readonly id: StableId;
  readonly publicationStatus: PublicationStatus;
  readonly path: InternalPath;
  readonly mediaType: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  readonly width: number;
  readonly height: number;
  readonly decorative: boolean;
  readonly altText: string;
}

export interface ProfileImageSource {
  readonly id: StableId;
  readonly mainAssetIds: readonly StableId[];
  readonly compactAssetIds: readonly StableId[];
}

export interface ResolvedProfileImage {
  readonly main: readonly PublicImageAsset[];
  readonly compact: readonly PublicImageAsset[];
}

export interface ResolvedExperienceRole extends Omit<
  ExperienceRole,
  "technologyIds"
> {
  readonly technologies: readonly Skill[];
}

export interface ResolvedExperience extends Omit<
  Experience,
  "logoAssetId" | "roles"
> {
  readonly logo: PublicImageAsset;
  readonly roles: readonly ResolvedExperienceRole[];
}

export interface ResolvedEducation extends Omit<Education, "logoAssetId"> {
  readonly logo: PublicImageAsset;
}

export interface SiteContentSource {
  readonly identity: SiteIdentitySource;
  readonly seo: SeoDefaults;
  readonly contacts: readonly ContactLink[];
  readonly socialLinks: readonly SocialLink[];
  readonly resumeAssets: readonly PublicResumeAsset[];
  readonly images: readonly PublicImageAsset[];
  readonly profileImage?: ProfileImageSource | undefined;
}

export interface ProfessionalContentSource {
  readonly experiences: readonly Experience[];
  readonly credibilityHighlights: readonly CredibilityHighlight[];
  readonly skills: readonly Skill[];
  readonly skillGroups: readonly SkillGroup[];
  readonly education: readonly Education[];
}

export interface LocalContentSource {
  readonly site: SiteContentSource;
  readonly professional: ProfessionalContentSource;
  readonly projects: readonly ProjectRecord[];
  readonly writings: readonly WritingRecord[];
}

export interface ValidatedContentSnapshot {
  readonly site: SiteContentSource;
  readonly professional: ProfessionalContentSource;
  readonly projects: readonly (PublishedProject | UnpublishedProject)[];
  readonly writings: readonly (PublishedWriting | UnpublishedWriting)[];
}

export interface PortfolioOverview {
  readonly identity: SiteIdentity;
  readonly seo: SeoMetadata;
  readonly canonicalOrigin: string;
  readonly contacts: readonly ContactLink[];
  readonly socialLinks: readonly SocialLink[];
  readonly experiences: readonly ResolvedExperience[];
  readonly credibilityHighlights: readonly CredibilityHighlight[];
  readonly skillGroups: readonly ResolvedSkillGroup[];
  readonly education: readonly ResolvedEducation[];
  readonly featuredProjects: readonly PublishedProject[];
  readonly recentWritings: readonly PublishedWriting[];
  readonly resumeAsset?: PublicResumeAsset | undefined;
  readonly profileImage?: ResolvedProfileImage | undefined;
}

export interface PublishedProjectCollection {
  readonly seo: SeoMetadata;
  readonly canonicalOrigin: string;
  readonly items: readonly PublishedProject[];
}

export interface PublishedWritingCollection {
  readonly seo: SeoMetadata;
  readonly canonicalOrigin: string;
  readonly items: readonly PublishedWriting[];
}

export type ContentLookup<T, K extends "project" | "writing"> =
  | { readonly kind: "found"; readonly content: T }
  | {
      readonly kind: "not-found";
      readonly contentType: K;
      readonly requestedSlug: string;
    };
