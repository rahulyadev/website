import { describe, expect, it } from "vitest";

import {
  DESIGN_SYSTEM_PREVIEW_QUERY,
  isDesignSystemPreviewSearch,
} from "../../app/design-system-preview/preview-gate";

describe("temporary design-system preview gate", () => {
  it("requires the exact query value without adding a public route", () => {
    expect(DESIGN_SYSTEM_PREVIEW_QUERY).toBe("preview=design-system");
    expect(isDesignSystemPreviewSearch("?preview=design-system")).toBe(true);
    expect(
      isDesignSystemPreviewSearch("?preview=design-system&viewport=mobile"),
    ).toBe(true);
    expect(isDesignSystemPreviewSearch("?preview=portfolio")).toBe(false);
    expect(isDesignSystemPreviewSearch("")).toBe(false);
  });
});
