import type { MetaDescriptor } from "react-router";

import type { InternalPath } from "../domain/content";
import type { PublicSeoMetadata } from "../domain/route-data";

export const PRODUCTION_ORIGIN = "https://rahuly.in";
export const PUBLIC_LANGUAGE = "en-IN";
export const OPEN_GRAPH_LOCALE = "en_IN";
export const SITE_NAME = "Rahul Yadav";
export const RSS_DISCOVERY_TITLE = "Rahul Yadav — Writings RSS";

const unsafeEncodedPathSegment = /%(?:2e|2f|5c)/i;

function containsControlOrWhitespace(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit <= 0x20 || codeUnit === 0x7f) return true;
  }
  return false;
}

export function assertProductionOrigin(
  origin: string,
): asserts origin is typeof PRODUCTION_ORIGIN {
  if (origin !== PRODUCTION_ORIGIN) {
    throw new Error(
      `Canonical origin must be exactly ${PRODUCTION_ORIGIN}; received ${origin}.`,
    );
  }

  const parsed = new URL(origin);
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.pathname !== "/" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(`Canonical origin is not a bare HTTPS origin: ${origin}.`);
  }
}

export function normalizeCanonicalPath(value: string): InternalPath {
  if (value === "" || !value.startsWith("/") || value.startsWith("//")) {
    throw new Error(`Canonical path must be an absolute site path: ${value}.`);
  }

  const queryIndex = value.indexOf("?");
  const fragmentIndex = value.indexOf("#");
  const boundaryCandidates = [queryIndex, fragmentIndex].filter(
    (index) => index >= 0,
  );
  const boundary =
    boundaryCandidates.length === 0
      ? value.length
      : Math.min(...boundaryCandidates);
  const pathname = value.slice(0, boundary);

  if (
    pathname === "" ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    pathname.includes("//") ||
    containsControlOrWhitespace(pathname) ||
    unsafeEncodedPathSegment.test(pathname)
  ) {
    throw new Error(`Canonical path is unsafe: ${value}.`);
  }

  let decodedPathname: string;
  try {
    decodedPathname = decodeURI(pathname);
  } catch {
    throw new Error(`Canonical path contains malformed encoding: ${value}.`);
  }

  if (!decodedPathname.startsWith("/")) {
    throw new Error(`Canonical path is unsafe: ${value}.`);
  }

  if (
    pathname.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new Error(
      `Canonical path cannot contain traversal segments: ${value}.`,
    );
  }

  if (pathname === "/") return pathname;
  return (
    pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
  ) as InternalPath;
}

export function resolveCanonicalUrl(origin: string, path: string) {
  assertProductionOrigin(origin);
  const normalizedPath = normalizeCanonicalPath(path);
  return new URL(normalizedPath, `${origin}/`).href;
}

interface ArticleMetadata {
  readonly publishedOn: string;
  readonly updatedOn?: string | undefined;
  readonly tags: readonly string[];
}

interface PageMetadataOptions {
  readonly canonicalOrigin: string;
  readonly seo: PublicSeoMetadata;
  readonly openGraphType: "article" | "website";
  readonly robots?: "noindex,follow" | undefined;
  readonly discoverFeed?: boolean | undefined;
  readonly article?: ArticleMetadata | undefined;
}

export function buildPageMetadata({
  canonicalOrigin,
  seo,
  openGraphType,
  robots,
  discoverFeed = false,
  article,
}: PageMetadataOptions): MetaDescriptor[] {
  if (discoverFeed && robots !== undefined) {
    throw new Error("Noindex pages must not advertise the public RSS feed.");
  }
  if ((openGraphType === "article") !== (article !== undefined)) {
    throw new Error("Article metadata must accompany only article pages.");
  }

  const canonicalUrl = resolveCanonicalUrl(canonicalOrigin, seo.canonicalPath);
  const descriptors: MetaDescriptor[] = [
    { title: seo.title },
    { name: "description", content: seo.description },
    ...(robots === undefined ? [] : [{ name: "robots", content: robots }]),
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:type", content: openGraphType },
    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: OPEN_GRAPH_LOCALE },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: seo.title },
    { name: "twitter:description", content: seo.description },
    { name: "twitter:url", content: canonicalUrl },
  ];

  if (article !== undefined) {
    descriptors.push(
      { property: "article:published_time", content: article.publishedOn },
      ...(article.updatedOn === undefined
        ? []
        : [
            {
              property: "article:modified_time",
              content: article.updatedOn,
            } satisfies MetaDescriptor,
          ]),
      ...article.tags.map((tag): MetaDescriptor => ({
        property: "article:tag",
        content: tag,
      })),
    );
  }

  if (discoverFeed) {
    descriptors.push({
      tagName: "link",
      rel: "alternate",
      type: "application/rss+xml",
      title: RSS_DISCOVERY_TITLE,
      href: resolveCanonicalUrl(canonicalOrigin, "/rss.xml"),
    });
  }

  return descriptors;
}

export function buildNotFoundMetadata(): MetaDescriptor[] {
  return [
    { title: "Page not found | Rahul Yadav" },
    { name: "robots", content: "noindex,follow" },
  ];
}
