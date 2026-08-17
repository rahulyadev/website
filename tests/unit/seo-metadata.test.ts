import { describe, expect, it } from "vitest";

import { projectPublicSeoMetadata } from "../../app/content/public-seo.server";
import {
  OPEN_GRAPH_LOCALE,
  PRODUCTION_ORIGIN,
  RSS_DISCOVERY_TITLE,
  SITE_NAME,
  buildNotFoundMetadata,
  buildPageMetadata,
  normalizeCanonicalPath,
  resolveCanonicalUrl,
} from "../../app/seo/metadata";

const seo = {
  title: "Projects | Rahul Yadav",
  description: "A working roadmap of useful products.",
  canonicalPath: "/projects" as const,
};

function namedMetadata(
  metadata: ReturnType<typeof buildPageMetadata>,
  name: string,
) {
  return metadata.filter(
    (descriptor) => "name" in descriptor && descriptor.name === name,
  );
}

function propertyMetadata(
  metadata: ReturnType<typeof buildPageMetadata>,
  property: string,
) {
  return metadata.filter(
    (descriptor) =>
      "property" in descriptor && descriptor.property === property,
  );
}

describe("canonical URL policy", () => {
  it.each([
    ["/", "/"],
    ["/?source=test#intro", "/"],
    ["/projects", "/projects"],
    ["/projects/", "/projects"],
    ["/projects/?source=test#top", "/projects"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeCanonicalPath(input)).toBe(expected);
  });

  it("preserves the home slash and removes non-home trailing slashes", () => {
    expect(resolveCanonicalUrl(PRODUCTION_ORIGIN, "/?ref=test")).toBe(
      "https://rahuly.in/",
    );
    expect(resolveCanonicalUrl(PRODUCTION_ORIGIN, "/writings/#article")).toBe(
      "https://rahuly.in/writings",
    );
  });

  it.each([
    "",
    "projects",
    "https://example.test/projects",
    "//example.test/projects",
    "/projects//detail",
    "/projects\\detail",
    "/projects/../private",
    "/projects/./detail",
    "/projects/%2e%2e/private",
    "/projects/%2Fprivate",
    "/projects/%5cprivate",
    "/projects/%zz",
    "/projects/ private",
  ])("rejects unsafe canonical path %s", (input) => {
    expect(() => normalizeCanonicalPath(input)).toThrow();
  });

  it("rejects every origin except the approved production origin", () => {
    expect(() => resolveCanonicalUrl("http://rahuly.in", "/")).toThrow();
    expect(() => resolveCanonicalUrl("https://www.rahuly.in", "/")).toThrow();
    expect(() => resolveCanonicalUrl("https://rahuly.in/path", "/")).toThrow();
  });
});

describe("shared page metadata", () => {
  it("builds unique factual text-only Open Graph, Twitter and feed metadata", () => {
    const metadata = buildPageMetadata({
      canonicalOrigin: PRODUCTION_ORIGIN,
      seo,
      openGraphType: "website",
      discoverFeed: true,
    });

    expect(metadata).toContainEqual({ title: seo.title });
    expect(namedMetadata(metadata, "description")).toEqual([
      { name: "description", content: seo.description },
    ]);
    expect(propertyMetadata(metadata, "og:type")).toEqual([
      { property: "og:type", content: "website" },
    ]);
    expect(propertyMetadata(metadata, "og:title")).toEqual([
      { property: "og:title", content: seo.title },
    ]);
    expect(propertyMetadata(metadata, "og:description")).toEqual([
      { property: "og:description", content: seo.description },
    ]);
    expect(propertyMetadata(metadata, "og:url")).toEqual([
      { property: "og:url", content: "https://rahuly.in/projects" },
    ]);
    expect(propertyMetadata(metadata, "og:site_name")).toEqual([
      { property: "og:site_name", content: SITE_NAME },
    ]);
    expect(propertyMetadata(metadata, "og:locale")).toEqual([
      { property: "og:locale", content: OPEN_GRAPH_LOCALE },
    ]);
    expect(namedMetadata(metadata, "twitter:card")).toEqual([
      { name: "twitter:card", content: "summary" },
    ]);
    expect(namedMetadata(metadata, "twitter:title")).toEqual([
      { name: "twitter:title", content: seo.title },
    ]);
    expect(namedMetadata(metadata, "twitter:description")).toEqual([
      { name: "twitter:description", content: seo.description },
    ]);
    expect(namedMetadata(metadata, "twitter:url")).toEqual([
      { name: "twitter:url", content: "https://rahuly.in/projects" },
    ]);
    expect(namedMetadata(metadata, "twitter:site")).toEqual([]);
    expect(namedMetadata(metadata, "twitter:creator")).toEqual([]);
    expect(propertyMetadata(metadata, "og:image")).toEqual([]);
    expect(namedMetadata(metadata, "twitter:image")).toEqual([]);
    expect(namedMetadata(metadata, "robots")).toEqual([]);
    expect(
      metadata.filter(
        (descriptor) =>
          "tagName" in descriptor && descriptor["rel"] === "canonical",
      ),
    ).toEqual([
      {
        tagName: "link",
        rel: "canonical",
        href: "https://rahuly.in/projects",
      },
    ]);
    expect(
      metadata.filter(
        (descriptor) =>
          "tagName" in descriptor && descriptor["rel"] === "alternate",
      ),
    ).toEqual([
      {
        tagName: "link",
        rel: "alternate",
        type: "application/rss+xml",
        title: RSS_DISCOVERY_TITLE,
        href: "https://rahuly.in/rss.xml",
      },
    ]);
  });

  it("adds exact noindex policy without feed discovery for a WIP page", () => {
    const metadata = buildPageMetadata({
      canonicalOrigin: PRODUCTION_ORIGIN,
      seo,
      openGraphType: "website",
      robots: "noindex,follow",
    });

    expect(namedMetadata(metadata, "robots")).toEqual([
      { name: "robots", content: "noindex,follow" },
    ]);
    expect(
      metadata.filter(
        (descriptor) =>
          "tagName" in descriptor && descriptor["rel"] === "alternate",
      ),
    ).toEqual([]);
  });

  it("keeps unknown and fallback metadata free of canonical, social and structured data", () => {
    expect(buildNotFoundMetadata()).toEqual([
      { title: "Page not found | Rahul Yadav" },
      { name: "robots", content: "noindex,follow" },
    ]);
  });

  it("prevents noindex pages from advertising the RSS feed", () => {
    expect(() =>
      buildPageMetadata({
        canonicalOrigin: PRODUCTION_ORIGIN,
        seo,
        openGraphType: "website",
        robots: "noindex,follow",
        discoverFeed: true,
      }),
    ).toThrow(/must not advertise/i);
  });
});

describe("public SEO projection", () => {
  it("allows only title, description and canonical path", () => {
    const projected = projectPublicSeoMetadata({
      ...seo,
      socialImageAssetId: "internal-social-asset-id",
    });

    expect(projected).toEqual(seo);
    expect(Object.keys(projected).sort()).toEqual([
      "canonicalPath",
      "description",
      "title",
    ]);
    expect(JSON.stringify(projected)).not.toContain("internal-social-asset-id");
  });
});
