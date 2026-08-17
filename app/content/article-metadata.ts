import type { WritingDetailPageData } from "../domain/route-data";

export function articleStructuredData(data: WritingDetailPageData) {
  const canonicalUrl = new URL(
    data.writing.seo.canonicalPath,
    data.canonicalOrigin,
  ).href;

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
      name: "Rahul Yadav",
      url: data.canonicalOrigin,
    },
    inLanguage: "en-IN",
    keywords: data.writing.tags,
  };
}
