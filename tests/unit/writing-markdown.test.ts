import { describe, expect, it } from "vitest";

import {
  MarkdownValidationError,
  parseMarkdownArticle,
} from "../../app/content/writing-markdown.server";

describe("writing Markdown parser", () => {
  it("projects supported Markdown into a serializable typed tree", () => {
    const parsed =
      parseMarkdownArticle(`Intro with **strong**, *emphasis*, ~~removed~~, and [a link](/writings/example).

## Design choices

- First item
- Second item with \`inline code\`

### Details

> A bounded quotation.

## Design choices

| Concern | Choice |
| --- | --- |
| Safety | Typed nodes |

\`\`\`python
print("escaped <value>")
\`\`\`
`);

    expect(parsed.article.format).toBe("article-tree");
    expect(parsed.article.tableOfContents).toEqual([
      { id: "design-choices", level: 2, text: "Design choices" },
      { id: "details", level: 3, text: "Details" },
      { id: "design-choices-2", level: 2, text: "Design choices" },
    ]);
    expect(parsed.headingIds).toEqual(
      new Set(["design-choices", "details", "design-choices-2"]),
    );
    expect(parsed.links).toEqual([{ href: "/writings/example" }]);
    expect(parsed.article.blocks.map((block) => block.kind)).toContain("table");
    expect(parsed.article.blocks.map((block) => block.kind)).toContain(
      "code-block",
    );
    expect(JSON.parse(JSON.stringify(parsed.article))).toEqual(parsed.article);
  });

  it("derives reading time from visible prose while excluding fenced code", () => {
    const prose = Array.from(
      { length: 226 },
      (_, index) => `word${String(index)}`,
    ).join(" ");
    const parsed = parseMarkdownArticle(
      `${prose}\n\n\`\`\`text\n${"code ".repeat(500)}\n\`\`\``,
    );

    expect(parsed.article.wordCount).toBe(226);
    expect(parsed.article.readingTimeMinutes).toBe(2);
  });

  it.each([
    ["# Page title", "level-one headings"],
    ["<script>alert('x')</script>", "raw HTML"],
    ["![alt](/asset.png)", "images"],
    ["- [x] completed", "task-list"],
    ["{runSomething()}", "MDX expressions"],
    ["[unsafe](javascript:alert(1))", "unsafe or unsupported link"],
    ["[unsafe](data:text/plain,value)", "unsafe or unsupported link"],
    ["[unsafe](//example.com/path)", "unsafe or unsupported link"],
    ["[unsafe](/../private)", "unsafe or unsupported link"],
    ["    indented code", "indent-based code blocks"],
  ])("rejects unsupported input %#", (markdown, message) => {
    expect(() => parseMarkdownArticle(markdown)).toThrow(
      new RegExp(message, "i"),
    );
  });

  it("returns field-level Markdown diagnostics", () => {
    try {
      parseMarkdownArticle("```Python extra\nvalue\n```");
      throw new Error("Expected Markdown parsing to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(MarkdownValidationError);
      if (!(error instanceof MarkdownValidationError)) throw error;
      expect(error.field).toBe("body.codeBlock.language");
      expect(error.reason).toContain("lowercase kebab-case");
    }
  });
});
