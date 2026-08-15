import type { SeoMetadata } from "./content";

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
  readonly credibilityHighlights: readonly {
    readonly lead: string;
    readonly detail: string;
  }[];
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
