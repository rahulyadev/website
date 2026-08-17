import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  loadWritingSources,
  WritingSourceError,
} from "../../app/content/writing-sources.server";

const publicationDate = new Date("2026-08-17T12:00:00.000Z");
let temporaryDirectory = "";

function articleSource(
  overrides: Record<string, unknown> = {},
  body = "## Design\n\nA complete article body.",
) {
  return `---\n${JSON.stringify(
    {
      id: "writing-example",
      slug: "example-writing",
      title: "Example writing",
      summary: "A concise example summary.",
      status: "published",
      publishedOn: "2026-08-17",
      tags: ["Testing"],
      featured: false,
      ...overrides,
    },
    null,
    2,
  )}\n---\n\n${body}\n`;
}

async function writeArticle(
  filename = "example-writing.md",
  source = articleSource(),
) {
  await writeFile(path.join(temporaryDirectory, filename), source, "utf8");
}

beforeEach(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "writing-source-"));
});

afterEach(async () => {
  await rm(temporaryDirectory, { force: true, recursive: true });
});

describe("writing source loader", () => {
  it("loads strict JSON front matter and parsed content without storage fields", async () => {
    await writeArticle();
    const records = await loadWritingSources({
      directory: temporaryDirectory,
      currentDate: publicationDate,
    });

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      metadata: {
        id: "writing-example",
        slug: "example-writing",
        publicationStatus: "published",
        featured: false,
        seo: {
          canonicalPath: "/writings/example-writing",
          title: "Example writing | Rahul Yadav",
        },
      },
      article: { format: "article-tree", readingTimeMinutes: 1 },
    });
    expect(JSON.stringify(records)).not.toContain(temporaryDirectory);
    expect(JSON.stringify(records)).not.toContain("sourcePath");
  });

  it("treats a missing directory as a valid empty collection", async () => {
    await expect(
      loadWritingSources({
        directory: path.join(temporaryDirectory, "missing"),
        currentDate: publicationDate,
      }),
    ).resolves.toEqual([]);
  });

  it.each([
    [
      "unknown front-matter field",
      articleSource({ unexpected: true }),
      "Unrecognized key",
    ],
    [
      "case-insensitive duplicate tags",
      articleSource({ tags: ["Testing", "testing"] }),
      "unique without regard to case",
    ],
    [
      "future publication date",
      articleSource({ publishedOn: "2026-08-18" }),
      "cannot be later than 2026-08-17",
    ],
    [
      "update before publication",
      articleSource({ updatedOn: "2026-08-16" }),
      "cannot precede publishedOn",
    ],
    ["empty published body", articleSource({}, ""), "body: is required"],
  ])(
    "rejects %s with file and field diagnostics",
    async (_, source, reason) => {
      await writeArticle("example-writing.md", source);
      await expect(
        loadWritingSources({
          directory: temporaryDirectory,
          currentDate: publicationDate,
        }),
      ).rejects.toThrow(new RegExp(`example-writing\\.md.*${reason}`, "s"));
    },
  );

  it("requires the filename to match the stable slug", async () => {
    await writeArticle("different.md");
    await expect(
      loadWritingSources({
        directory: temporaryDirectory,
        currentDate: publicationDate,
      }),
    ).rejects.toThrow(/frontmatter\.slug.*example-writing\.md/s);
  });

  it("rejects published links to draft or missing writing slugs", async () => {
    await writeArticle(
      "example-writing.md",
      articleSource(
        {},
        "## Design\n\nRead [the draft](/writings/draft-writing).",
      ),
    );
    await writeArticle(
      "draft-writing.md",
      articleSource(
        {
          id: "writing-draft",
          slug: "draft-writing",
          status: "draft",
          publishedOn: undefined,
        },
        "Draft notes.",
      ),
    );

    await expect(
      loadWritingSources({
        directory: temporaryDirectory,
        currentDate: publicationDate,
      }),
    ).rejects.toThrow(/links to missing or unpublished writing slug/s);
  });

  it("validates same-page fragments against generated heading IDs", async () => {
    await writeArticle(
      "example-writing.md",
      articleSource({}, "## Design\n\n[Missing section](#missing-section)."),
    );
    await expect(
      loadWritingSources({
        directory: temporaryDirectory,
        currentDate: publicationDate,
      }),
    ).rejects.toThrow(/fragment #missing-section does not match/s);
  });

  it("rejects nested directories, non-Markdown files, symlinks, and invalid UTF-8", async () => {
    const nested = path.join(temporaryDirectory, "nested");
    await mkdir(nested);
    await expect(
      loadWritingSources({ directory: temporaryDirectory }),
    ).rejects.toThrow(/nested directories/s);
    await rm(nested, { recursive: true });

    await writeFile(
      path.join(temporaryDirectory, "notes.txt"),
      "notes",
      "utf8",
    );
    await expect(
      loadWritingSources({ directory: temporaryDirectory }),
    ).rejects.toThrow(/only \.md files/s);
    await rm(path.join(temporaryDirectory, "notes.txt"));

    await writeFile(
      path.join(temporaryDirectory, "target.md"),
      articleSource(),
    );
    await symlink(
      path.join(temporaryDirectory, "target.md"),
      path.join(temporaryDirectory, "linked.md"),
    );
    await expect(
      loadWritingSources({ directory: temporaryDirectory }),
    ).rejects.toThrow(/symbolic links/s);
    await rm(path.join(temporaryDirectory, "linked.md"));
    await rm(path.join(temporaryDirectory, "target.md"));

    await writeFile(
      path.join(temporaryDirectory, "invalid.md"),
      Buffer.from([0xff, 0xfe]),
    );
    await expect(
      loadWritingSources({ directory: temporaryDirectory }),
    ).rejects.toThrow(/valid UTF-8/s);
  });

  it("exposes structured diagnostics on failures", async () => {
    await writeArticle("example-writing.md", "not front matter");
    try {
      await loadWritingSources({ directory: temporaryDirectory });
      throw new Error("Expected source loading to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(WritingSourceError);
      if (!(error instanceof WritingSourceError)) throw error;
      expect(error.diagnostics).toHaveLength(1);
      expect(error.diagnostics[0]).toMatchObject({
        file: "example-writing.md",
        field: "frontmatter",
      });
      expect(error.diagnostics[0]?.reason).toContain("must begin");
    }
  });
});
