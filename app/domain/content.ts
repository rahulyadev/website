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
  readonly professionalPositioning: string;
  readonly introduction: string;
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

export interface ExperienceRole {
  readonly id: StableId;
  readonly title: string;
  readonly dates: DateRange;
  readonly summary: string;
  readonly responsibilities: readonly OrderedStatement[];
  readonly technologyIds: readonly StableId[];
  readonly order: number;
}

export interface Experience {
  readonly id: StableId;
  readonly organization: string;
  readonly roles: readonly ExperienceRole[];
  readonly order: number;
  readonly featured: boolean;
}

export interface CredibilityHighlight {
  readonly id: StableId;
  readonly statement: string;
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

export interface SkillGroup {
  readonly id: StableId;
  readonly name: string;
  readonly skills: readonly OrderedSkillReference[];
  readonly order: number;
}

export interface ResolvedSkillGroup {
  readonly id: StableId;
  readonly name: string;
  readonly skills: readonly Skill[];
  readonly order: number;
}

export interface Education {
  readonly id: StableId;
  readonly institution: string;
  readonly affiliation: string;
  readonly credential: string;
  readonly fieldOfStudy: string;
  readonly dates: DateRange;
  readonly score?: string | undefined;
  readonly order: number;
}

export type PublicationStatus = "draft" | "published" | "archived";

export interface PublicLink {
  readonly id: StableId;
  readonly kind: "internal" | "external" | "live" | "source";
  readonly label: string;
  readonly href: string;
  readonly order: number;
}

export interface ProjectRecord {
  readonly id: StableId;
  readonly slug: Slug;
  readonly title: string;
  readonly publicationStatus: PublicationStatus;
  readonly projectStatus?: string | undefined;
  readonly summary?: string | undefined;
  readonly problem?: string | undefined;
  readonly role?: string | undefined;
  readonly approach?: string | undefined;
  readonly architecture?: string | undefined;
  readonly order?: number | undefined;
  readonly featuredOrder?: number | undefined;
  readonly decisions: readonly OrderedStatement[];
  readonly outcomes: readonly OrderedStatement[];
  readonly technologyIds: readonly StableId[];
  readonly links: readonly PublicLink[];
  readonly imageAssetIds: readonly StableId[];
  readonly relatedProjectIds: readonly StableId[];
  readonly seo?: SeoMetadata | undefined;
}

export interface PublishedProject extends ProjectRecord {
  readonly publicationStatus: "published";
  readonly projectStatus: string;
  readonly summary: string;
  readonly problem: string;
  readonly role: string;
  readonly approach: string;
  readonly architecture: string;
  readonly order: number;
  readonly seo: SeoMetadata;
}

export interface UnpublishedProject extends ProjectRecord {
  readonly publicationStatus: "draft" | "archived";
}

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

export interface SiteContentSource {
  readonly identity: SiteIdentitySource;
  readonly seo: SeoDefaults;
  readonly contacts: readonly ContactLink[];
  readonly socialLinks: readonly SocialLink[];
  readonly resumeAssets: readonly PublicResumeAsset[];
  readonly images: readonly PublicImageAsset[];
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
  readonly experiences: readonly Experience[];
  readonly credibilityHighlights: readonly CredibilityHighlight[];
  readonly skillGroups: readonly ResolvedSkillGroup[];
  readonly education: readonly Education[];
  readonly featuredProjects: readonly PublishedProject[];
  readonly recentWritings: readonly PublishedWriting[];
  readonly resumeAsset?: PublicResumeAsset | undefined;
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
