import type { PublishedWriting } from "../domain/content";
import type {
  WritingDetailPageLookup,
  WritingIndexItemData,
  WritingSiblingData,
  WritingsPageData,
} from "../domain/route-data";
import type { ContentRepository } from "./content-repository";
import { getContentRepository } from "./content.server";
import { projectPublicSeoMetadata } from "./public-seo.server";
import { PUBLIC_LANGUAGE, resolveCanonicalUrl } from "../seo/metadata";

function writingIndexItem(writing: PublishedWriting): WritingIndexItemData {
  return {
    slug: writing.metadata.slug,
    title: writing.metadata.title,
    summary: writing.metadata.summary,
    publishedOn: writing.metadata.publishedOn,
    readingTimeMinutes: writing.article.readingTimeMinutes,
    tags: writing.metadata.tags,
  };
}

function writingSibling(
  writing: PublishedWriting | undefined,
): WritingSiblingData | undefined {
  return writing === undefined
    ? undefined
    : {
        title: writing.metadata.title,
        path: `/writings/${writing.metadata.slug}`,
      };
}

export async function loadWritingsPageData(
  repository: ContentRepository = getContentRepository(),
): Promise<WritingsPageData> {
  const collection = await repository.getPublishedWritings();
  return {
    canonicalOrigin: collection.canonicalOrigin,
    seo: projectPublicSeoMetadata(collection.seo),
    items: collection.items.map(writingIndexItem),
  };
}

export async function loadWritingDetailPageData(
  slug: string,
  repository: ContentRepository = getContentRepository(),
): Promise<WritingDetailPageLookup> {
  const [lookup, collection] = await Promise.all([
    repository.getWritingBySlug(slug),
    repository.getPublishedWritings(),
  ]);

  if (lookup.kind === "not-found") {
    return { kind: "not-found", requestedSlug: lookup.requestedSlug };
  }

  const writingIndex = collection.items.findIndex(
    (writing) => writing.metadata.slug === lookup.content.metadata.slug,
  );
  if (writingIndex < 0) {
    throw new Error(
      `Published writing ${lookup.content.metadata.slug} is missing from its collection.`,
    );
  }

  const writing = lookup.content;
  const newerWriting = writingSibling(collection.items[writingIndex - 1]);
  const olderWriting = writingSibling(collection.items[writingIndex + 1]);
  const writingTags = new Set(
    writing.metadata.tags.map((tag) => tag.toLocaleLowerCase()),
  );
  const relatedWritings = collection.items
    .filter(
      (candidate) =>
        candidate.metadata.slug !== writing.metadata.slug &&
        candidate.metadata.tags.some((tag) =>
          writingTags.has(tag.toLocaleLowerCase()),
        ),
    )
    .slice(0, 2)
    .map(writingSibling)
    .filter((candidate) => candidate !== undefined);

  return {
    kind: "found",
    data: {
      canonicalOrigin: collection.canonicalOrigin,
      writing: {
        slug: writing.metadata.slug,
        title: writing.metadata.title,
        summary: writing.metadata.summary,
        publishedOn: writing.metadata.publishedOn,
        ...(writing.metadata.updatedOn === undefined
          ? {}
          : { updatedOn: writing.metadata.updatedOn }),
        readingTimeMinutes: writing.article.readingTimeMinutes,
        tags: writing.metadata.tags,
        seo: projectPublicSeoMetadata(writing.metadata.seo),
        article: {
          blocks: writing.article.blocks,
          tableOfContents: writing.article.tableOfContents,
        },
      },
      relatedWritings,
      ...(newerWriting === undefined ? {} : { newerWriting }),
      ...(olderWriting === undefined ? {} : { olderWriting }),
    },
  };
}

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rssDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toUTCString();
}

export function latestRssBuildDate(
  writings: readonly PublishedWriting[],
): string | undefined {
  return writings
    .map(
      (writing) => writing.metadata.updatedOn ?? writing.metadata.publishedOn,
    )
    .sort((left, right) => right.localeCompare(left))[0];
}

export async function loadRssXml(
  repository: ContentRepository = getContentRepository(),
) {
  const collection = await repository.getPublishedWritings();
  const channelUrl = resolveCanonicalUrl(
    collection.canonicalOrigin,
    "/writings",
  );
  const feedUrl = resolveCanonicalUrl(collection.canonicalOrigin, "/rss.xml");
  const items = collection.items
    .map((writing) => {
      const url = resolveCanonicalUrl(
        collection.canonicalOrigin,
        writing.metadata.seo.canonicalPath,
      );
      const categories = writing.metadata.tags
        .map((tag) => `      <category>${xmlEscape(tag)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${xmlEscape(writing.metadata.title)}</title>`,
        `      <link>${xmlEscape(url)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(url)}</guid>`,
        `      <pubDate>${xmlEscape(rssDate(writing.metadata.publishedOn))}</pubDate>`,
        `      <description>${xmlEscape(writing.metadata.summary)}</description>`,
        categories,
        "    </item>",
      ]
        .filter((line) => line.length > 0)
        .join("\n");
    })
    .join("\n");
  const latestBuildDate = latestRssBuildDate(collection.items);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Rahul Yadav — Writings</title>",
    `    <link>${xmlEscape(channelUrl)}</link>`,
    "    <description>Engineering notes by Rahul Yadav on backend systems, modernization, testing, and maintainable software.</description>",
    `    <language>${PUBLIC_LANGUAGE}</language>`,
    `    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...(latestBuildDate === undefined
      ? []
      : [
          `    <lastBuildDate>${xmlEscape(rssDate(latestBuildDate))}</lastBuildDate>`,
        ]),
    ...(items.length === 0 ? [] : [items]),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

export async function loadSitemapXml(
  repository: ContentRepository = getContentRepository(),
) {
  const writings = await repository.getPublishedWritings();
  const origin = writings.canonicalOrigin;

  const entries: { readonly path: string; readonly lastmod?: string }[] = [
    { path: "/" },
    { path: "/projects" },
    { path: "/writings" },
    ...writings.items.map((writing) => ({
      path: writing.metadata.seo.canonicalPath,
      lastmod: writing.metadata.updatedOn ?? writing.metadata.publishedOn,
    })),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.flatMap((entry) => [
      "  <url>",
      `    <loc>${xmlEscape(resolveCanonicalUrl(origin, entry.path))}</loc>`,
      ...(entry.lastmod === undefined
        ? []
        : [`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`]),
      "  </url>",
    ]),
    "</urlset>",
    "",
  ].join("\n");
}
