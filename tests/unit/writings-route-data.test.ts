import { describe, expect, it } from "vitest";

import type { PublishedWriting } from "../../app/domain/content";
import {
  latestRssBuildDate,
  loadRssXml,
  loadSitemapXml,
  loadWritingDetailPageData,
  loadWritingsPageData,
} from "../../app/content/writings-route-data.server";

const slugs = [
  "async-document-processing-retries-dlq",
  "database-backed-pytest-fixtures",
  "jwt-revocation-rate-limiting-redis",
  "phased-application-modernization",
  "reducing-api-payloads",
] as const;

const publicationDates = [
  "2026-08-17",
  "2026-08-10",
  "2026-08-03",
  "2026-07-27",
  "2026-07-20",
] as const;

function elementTexts(document: Document, selector: string) {
  return [...document.querySelectorAll(selector)].map(
    (element) => element.textContent,
  );
}

describe("writing route-data projections", () => {
  it("returns five deterministically ordered summary-only index records", async () => {
    const data = await loadWritingsPageData();

    expect(data.canonicalOrigin).toBe("https://rahuly.in");
    expect(data.seo.canonicalPath).toBe("/writings");
    expect(data.items.map((writing) => writing.slug)).toEqual(slugs);
    expect(data.items.map((writing) => writing.publishedOn)).toEqual(
      publicationDates,
    );
    for (const writing of data.items) {
      expect(Object.keys(writing).sort()).toEqual([
        "publishedOn",
        "readingTimeMinutes",
        "slug",
        "summary",
        "tags",
        "title",
      ]);
      expect(new Date(`${writing.publishedOn}T00:00:00.000Z`).getUTCDay()).toBe(
        1,
      );
      expect(writing.readingTimeMinutes).toBeGreaterThan(0);
    }
    expect(JSON.stringify(data)).not.toContain('"article"');
    expect(JSON.stringify(data)).not.toContain('"id"');
    expect(JSON.stringify(data)).not.toContain("publicationStatus");
    expect(JSON.stringify(data)).not.toContain("sourcePath");
  });

  it("returns only the selected article tree plus minimal public navigation", async () => {
    const lookup = await loadWritingDetailPageData(
      "phased-application-modernization",
    );
    expect(lookup.kind).toBe("found");
    if (lookup.kind === "not-found") return;

    expect(Object.keys(lookup.data).sort()).toEqual([
      "canonicalOrigin",
      "newerWriting",
      "olderWriting",
      "relatedWritings",
      "writing",
    ]);
    expect(Object.keys(lookup.data.writing).sort()).toEqual([
      "article",
      "publishedOn",
      "readingTimeMinutes",
      "seo",
      "slug",
      "summary",
      "tags",
      "title",
    ]);
    expect(lookup.data.writing.article.blocks.length).toBeGreaterThan(10);
    expect(lookup.data.writing.article.tableOfContents.length).toBeGreaterThan(
      3,
    );
    expect(lookup.data.newerWriting).toEqual({
      title: "Designing JWT Revocation and API Rate Limiting with Redis",
      path: "/writings/jwt-revocation-rate-limiting-redis",
    });
    expect(lookup.data.olderWriting).toEqual({
      title: "Reducing API Payloads with Response Shaping and Compression",
      path: "/writings/reducing-api-payloads",
    });
    const serialized = JSON.stringify(lookup.data);
    expect(serialized).not.toContain("wordCount");
    expect(serialized).not.toContain("publicationStatus");
    expect(serialized).not.toContain("writing-phased");
    expect(serialized).not.toContain("Large API responses usually grow");
  });

  it("projects newer and older navigation from the publication chronology", async () => {
    const expected = [
      {
        slug: slugs[0],
        newer: undefined,
        older: slugs[1],
      },
      { slug: slugs[1], newer: slugs[0], older: slugs[2] },
      { slug: slugs[2], newer: slugs[1], older: slugs[3] },
      { slug: slugs[3], newer: slugs[2], older: slugs[4] },
      { slug: slugs[4], newer: slugs[3], older: undefined },
    ] as const;

    for (const relationship of expected) {
      const lookup = await loadWritingDetailPageData(relationship.slug);
      if (lookup.kind === "not-found") throw new Error("Expected writing.");
      expect(lookup.data.newerWriting?.path).toBe(
        relationship.newer === undefined
          ? undefined
          : `/writings/${relationship.newer}`,
      );
      expect(lookup.data.olderWriting?.path).toBe(
        relationship.older === undefined
          ? undefined
          : `/writings/${relationship.older}`,
      );
    }
  });

  it("returns a typed not-found result for missing and unpublished slugs", async () => {
    await expect(loadWritingDetailPageData("missing-writing")).resolves.toEqual(
      { kind: "not-found", requestedSlug: "missing-writing" },
    );
  });
});

describe("writing XML projections", () => {
  it("generates deterministic summary-only RSS with absolute permalinks", async () => {
    const xml = await loadRssXml();
    const document = new DOMParser().parseFromString(xml, "application/xml");
    const items = [...document.querySelectorAll("item")];

    expect(document.querySelector("parsererror")).toBeNull();
    expect(items).toHaveLength(5);
    expect(elementTexts(document, "item > link")).toEqual(
      slugs.map((slug) => `https://rahuly.in/writings/${slug}`),
    );
    expect(elementTexts(document, "item > guid")).toEqual(
      slugs.map((slug) => `https://rahuly.in/writings/${slug}`),
    );
    expect(document.querySelectorAll("item > description")).toHaveLength(5);
    expect(document.querySelector("channel > language")?.textContent).toBe(
      "en-IN",
    );
    expect(document.querySelector("channel > lastBuildDate")?.textContent).toBe(
      "Mon, 17 Aug 2026 00:00:00 GMT",
    );
    expect(elementTexts(document, "item > pubDate")).toEqual([
      "Mon, 17 Aug 2026 00:00:00 GMT",
      "Mon, 10 Aug 2026 00:00:00 GMT",
      "Mon, 03 Aug 2026 00:00:00 GMT",
      "Mon, 27 Jul 2026 00:00:00 GMT",
      "Mon, 20 Jul 2026 00:00:00 GMT",
    ]);
    expect(document.querySelector("encoded")).toBeNull();
    expect(xml).not.toContain("Modernizing an application is rarely");
    expect(xml).not.toContain("sourcePath");
  });

  it("uses the latest update date for RSS even when it is not the newest publication", async () => {
    const lookup = await loadWritingDetailPageData("reducing-api-payloads");
    if (lookup.kind === "not-found") throw new Error("Expected writing.");
    const repositoryWriting: PublishedWriting = {
      metadata: {
        id: "rss-date-test",
        slug: lookup.data.writing.slug,
        title: lookup.data.writing.title,
        publicationStatus: "published",
        summary: lookup.data.writing.summary,
        publishedOn: lookup.data.writing.publishedOn,
        updatedOn: "2026-09-01",
        tags: lookup.data.writing.tags,
        featured: false,
        seo: lookup.data.writing.seo,
      },
      article: {
        format: "article-tree",
        blocks: [],
        tableOfContents: [],
        readingTimeMinutes: 1,
        wordCount: 1,
      },
    };

    expect(latestRssBuildDate([repositoryWriting])).toBe("2026-09-01");
  });

  it("generates the exact public sitemap and article-only lastmod values", async () => {
    const xml = await loadSitemapXml();
    const document = new DOMParser().parseFromString(xml, "application/xml");
    const locations = elementTexts(document, "url > loc");

    expect(document.querySelector("parsererror")).toBeNull();
    expect(locations).toEqual([
      "https://rahuly.in/",
      "https://rahuly.in/projects",
      "https://rahuly.in/writings",
      ...slugs.map((slug) => `https://rahuly.in/writings/${slug}`),
    ]);
    expect(locations).toHaveLength(8);
    expect(document.querySelectorAll("lastmod")).toHaveLength(5);
    expect(elementTexts(document, "lastmod")).toEqual(publicationDates);
    expect(xml).not.toContain("rss.xml");
    expect(xml).not.toContain("sitemap.xml");
  });
});
