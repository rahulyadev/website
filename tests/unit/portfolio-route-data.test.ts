import { describe, expect, it } from "vitest";

import {
  loadHomePageData,
  loadSiteShellData,
} from "../../app/content/portfolio-route-data.server";

function expectExactKeys(value: object, keys: readonly string[]) {
  expect(Object.keys(value).sort()).toEqual([...keys].sort());
}

describe("portfolio route-data projections", () => {
  it("keeps the root shell payload to identity and compact portrait fields", async () => {
    const data = await loadSiteShellData();

    expectExactKeys(data, ["identity", "compactPortrait"]);
    expectExactKeys(data.identity, ["displayName", "roleLabel"]);
    expectExactKeys(data.compactPortrait, ["altText", "variants"]);
    expect(data.compactPortrait.altText).toBe("");
    expect(data.compactPortrait.variants).toHaveLength(6);
    for (const variant of data.compactPortrait.variants) {
      expectExactKeys(variant, ["height", "mediaType", "path", "width"]);
      expect(variant.height).toBe((variant.width * 5) / 4);
    }

    expect(JSON.stringify(data)).not.toMatch(
      /approvedOn|byteSize|metadataRemovalVerified|sha256|sourcePath/,
    );
  });

  it("returns only the home fields needed for Milestone 5", async () => {
    const data = await loadHomePageData();

    expectExactKeys(data, [
      "canonicalOrigin",
      "seo",
      "identity",
      "location",
      "credibilityHighlights",
      "contacts",
      "socialLinks",
      "resume",
      "portrait",
    ]);
    expectExactKeys(data.identity, [
      "displayName",
      "roleLabel",
      "professionalPositioning",
      "introduction",
      "opportunityStatement",
    ]);
    expectExactKeys(data.resume, ["downloadName", "path", "title"]);
    expect(data.location).toBe("Bangalore, Mumbai, India");
    expect(data.contacts.map((contact) => contact.kind).sort()).toEqual([
      "email",
      "phone",
    ]);
    expect(data.socialLinks.map((link) => link.platform).sort()).toEqual([
      "github",
      "linkedin",
    ]);
    expect(data.portrait.altText).not.toBe("");
    expect(data.portrait.variants).toHaveLength(9);
    expect(data.credibilityHighlights).toHaveLength(5);
    for (const highlight of data.credibilityHighlights) {
      expectExactKeys(highlight, ["detail", "lead"]);
    }

    const serialized = JSON.stringify(data);
    expect(serialized).not.toMatch(
      /approvedOn|byteSize|linkCount|linkValidationVerified|metadataRemovalVerified|pageCount|sha256|sourcePath/,
    );
    expect(serialized).not.toMatch(
      /education|experiences|featuredProjects|recentWritings|skillGroups|supportingClaimIds/,
    );
  });
});
