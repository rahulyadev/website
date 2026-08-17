import type { SeoMetadata, SkillGroupCategory } from "./content";

export interface ResponsiveImageVariant {
  readonly height: number;
  readonly mediaType: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  readonly path: string;
  readonly width: number;
}

export interface ResponsiveImageData {
  readonly altText: string;
  readonly variants: readonly ResponsiveImageVariant[];
}

export interface SiteShellData {
  readonly identity: {
    readonly displayName: string;
    readonly roleLabel: string;
  };
  readonly compactPortrait: ResponsiveImageData;
}

export interface OrganizationLogoData {
  readonly path: string;
  readonly width: number;
  readonly height: number;
  readonly altText: string;
}

export interface HomeTextSegmentData {
  readonly text: string;
  readonly emphasized: boolean;
}

export interface HomeExperienceRoleData {
  readonly title: string;
  readonly dateRange: string;
  readonly location: string;
  readonly engagement?:
    | {
        readonly label: "Customer engagement";
        readonly organization: string;
      }
    | undefined;
  readonly summary: string;
  readonly contributions: readonly (readonly HomeTextSegmentData[])[];
  readonly technologies: readonly string[];
}

export interface HomeExperienceData {
  readonly organization: string;
  readonly featured: boolean;
  readonly logo: OrganizationLogoData;
  readonly roles: readonly HomeExperienceRoleData[];
}

export interface HomeSkillGroupData {
  readonly category: SkillGroupCategory;
  readonly name: string;
  readonly skills: readonly string[];
}

export interface HomeEducationData {
  readonly institution: string;
  readonly credential: string;
  readonly fieldOfStudy: string;
  readonly dateRange: string;
  readonly score: string;
  readonly logo: OrganizationLogoData;
}

export interface HomeCredibilityCardData {
  readonly title: string;
  readonly body?: string | undefined;
  readonly outcomes?:
    | readonly {
        readonly label: string;
        readonly detail: string;
      }[]
    | undefined;
}

export interface HomePageData {
  readonly canonicalOrigin: string;
  readonly seo: SeoMetadata;
  readonly location: string;
  readonly identity: {
    readonly displayName: string;
    readonly roleLabel: string;
    readonly professionalPositioning: string;
    readonly introduction: string;
    readonly opportunityStatement: string;
  };
  readonly credibilityCards: readonly HomeCredibilityCardData[];
  readonly experiences: readonly HomeExperienceData[];
  readonly skillGroups: readonly HomeSkillGroupData[];
  readonly education: readonly HomeEducationData[];
  readonly contacts: readonly {
    readonly href: string;
    readonly kind: "email" | "phone";
    readonly label: string;
  }[];
  readonly socialLinks: readonly {
    readonly label: string;
    readonly platform: string;
    readonly url: string;
  }[];
  readonly resume: {
    readonly downloadName: string;
    readonly path: string;
    readonly title: string;
  };
  readonly portrait: ResponsiveImageData;
}
