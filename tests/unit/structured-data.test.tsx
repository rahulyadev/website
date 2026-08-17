import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { loadHomePageData } from "../../app/content/portfolio-route-data.server";
import {
  loadWritingDetailPageData,
  loadWritingsPageData,
} from "../../app/content/writings-route-data.server";
import { JsonLd, serializeJsonLd } from "../../app/seo/json-ld";
import {
  articleBreadcrumbStructuredData,
  articleStructuredData,
  profilePageStructuredData,
  websiteStructuredData,
  writingsCollectionStructuredData,
} from "../../app/seo/structured-data";

function expectExactKeys(value: object, keys: readonly string[]) {
  expect(Object.keys(value).sort()).toEqual([...keys].sort());
}

describe("factual structured-data builders", () => {
  it("projects a minimal WebSite and visible ProfilePage Person on home", async () => {
    const home = await loadHomePageData();
    const website = websiteStructuredData(home);
    const profile = profilePageStructuredData(home);

    expectExactKeys(website, [
      "@context",
      "@type",
      "name",
      "url",
      "inLanguage",
    ]);
    expect(website).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Rahul Yadav",
      url: "https://rahuly.in/",
      inLanguage: "en-IN",
    });

    expectExactKeys(profile, [
      "@context",
      "@type",
      "name",
      "url",
      "inLanguage",
      "mainEntity",
    ]);
    expectExactKeys(profile.mainEntity, [
      "@type",
      "name",
      "url",
      "jobTitle",
      "description",
      "sameAs",
    ]);
    expect(profile.mainEntity).toEqual({
      "@type": "Person",
      name: home.identity.displayName,
      url: "https://rahuly.in/",
      jobTitle: home.identity.roleLabel,
      description: home.identity.professionalPositioning,
      sameAs: home.socialLinks.map((link) => link.url),
    });
    expect(JSON.stringify(profile)).not.toMatch(
      /email|phone|employer|image|location|publisher|rating|review/,
    );
  });

  it("projects the five visible writings in their exact CollectionPage ItemList order", async () => {
    const writings = await loadWritingsPageData();
    const structured = writingsCollectionStructuredData(writings);

    expectExactKeys(structured, [
      "@context",
      "@type",
      "name",
      "url",
      "inLanguage",
      "mainEntity",
    ]);
    expectExactKeys(structured.mainEntity, ["@type", "itemListElement"]);
    expect(structured.mainEntity.itemListElement).toHaveLength(5);
    expect(structured.mainEntity.itemListElement).toEqual(
      writings.items.map((writing, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: writing.title,
        url: `https://rahuly.in/writings/${writing.slug}`,
      })),
    );
  });

  it("projects factual Article and visible breadcrumb data with exact allowlists", async () => {
    const lookup = await loadWritingDetailPageData("reducing-api-payloads");
    if (lookup.kind === "not-found") throw new Error("Expected writing.");
    const article = articleStructuredData(lookup.data);
    const breadcrumb = articleBreadcrumbStructuredData(lookup.data);

    expectExactKeys(article, [
      "@context",
      "@type",
      "headline",
      "description",
      "datePublished",
      "mainEntityOfPage",
      "author",
      "inLanguage",
      "keywords",
    ]);
    expectExactKeys(article.author, ["@type", "name", "url"]);
    expect(article).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: lookup.data.writing.title,
      description: lookup.data.writing.summary,
      datePublished: lookup.data.writing.publishedOn,
      mainEntityOfPage: "https://rahuly.in/writings/reducing-api-payloads",
      author: {
        "@type": "Person",
        name: "Rahul Yadav",
        url: "https://rahuly.in/",
      },
      inLanguage: "en-IN",
      keywords: lookup.data.writing.tags,
    });
    expect(article).not.toHaveProperty("publisher");
    expect(article).not.toHaveProperty("image");
    expect(article).not.toHaveProperty("dateModified");

    expectExactKeys(breadcrumb, ["@context", "@type", "itemListElement"]);
    expect(breadcrumb.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://rahuly.in/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writings",
        item: "https://rahuly.in/writings",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: lookup.data.writing.title,
      },
    ]);
  });
});

describe("JSON-LD serialization", () => {
  it("round-trips hostile strings without a literal script terminator", () => {
    const hostile = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: '</script><script>alert("xss")</script>&\u2028\u2029',
    } as const;
    const serialized = serializeJsonLd(hostile);
    const markup = renderToStaticMarkup(<JsonLd data={hostile} />);

    expect(JSON.parse(serialized)).toEqual(hostile);
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("&");
    expect(serialized).not.toContain("\u2028");
    expect(serialized).not.toContain("\u2029");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u0026");
    expect(markup).toContain('type="application/ld+json"');
    expect(markup).not.toContain("</script><script>");
  });
});
