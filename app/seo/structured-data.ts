import type {
  HomePageData,
  WritingDetailPageData,
  WritingsPageData,
} from "../domain/route-data";
import { PUBLIC_LANGUAGE, SITE_NAME, resolveCanonicalUrl } from "./metadata";

export function websiteStructuredData(data: HomePageData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: resolveCanonicalUrl(data.canonicalOrigin, "/"),
    inLanguage: PUBLIC_LANGUAGE,
  } as const;
}

export function profilePageStructuredData(data: HomePageData) {
  const canonicalUrl = resolveCanonicalUrl(
    data.canonicalOrigin,
    data.seo.canonicalPath,
  );

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: data.identity.displayName,
    url: canonicalUrl,
    inLanguage: PUBLIC_LANGUAGE,
    mainEntity: {
      "@type": "Person",
      name: data.identity.displayName,
      url: canonicalUrl,
      jobTitle: data.identity.roleLabel,
      description: data.identity.professionalPositioning,
      sameAs: data.socialLinks.map((link) => link.url),
    },
  } as const;
}

export function writingsCollectionStructuredData(data: WritingsPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Writings",
    url: resolveCanonicalUrl(data.canonicalOrigin, data.seo.canonicalPath),
    inLanguage: PUBLIC_LANGUAGE,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.items.map((writing, index) => ({
        "@type": "ListItem" as const,
        position: index + 1,
        name: writing.title,
        url: resolveCanonicalUrl(
          data.canonicalOrigin,
          `/writings/${writing.slug}`,
        ),
      })),
    },
  } as const;
}

export function articleStructuredData(data: WritingDetailPageData) {
  const canonicalUrl = resolveCanonicalUrl(
    data.canonicalOrigin,
    data.writing.seo.canonicalPath,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.writing.title,
    description: data.writing.summary,
    datePublished: data.writing.publishedOn,
    ...(data.writing.updatedOn === undefined
      ? {}
      : { dateModified: data.writing.updatedOn }),
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: resolveCanonicalUrl(data.canonicalOrigin, "/"),
    },
    inLanguage: PUBLIC_LANGUAGE,
    keywords: data.writing.tags,
  } as const;
}

export function articleBreadcrumbStructuredData(data: WritingDetailPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: resolveCanonicalUrl(data.canonicalOrigin, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writings",
        item: resolveCanonicalUrl(data.canonicalOrigin, "/writings"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.writing.title,
      },
    ],
  } as const;
}
