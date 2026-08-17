import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";

import { z } from "zod";

import type { WritingRecord } from "../domain/content";
import {
  fullDateSchema,
  nonemptyTextSchema,
  stableIdSchema,
  slugSchema,
} from "./content-schemas.server";
import {
  MarkdownValidationError,
  parseMarkdownArticle,
  type ParsedArticleLink,
} from "./writing-markdown.server";

const writingsDirectory = path.resolve(process.cwd(), "content", "writings");
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

const writingFrontmatterSchema = z
  .object({
    id: stableIdSchema,
    slug: slugSchema,
    title: nonemptyTextSchema.max(140),
    summary: nonemptyTextSchema.max(320),
    status: z.enum(["draft", "published", "archived"]),
    publishedOn: fullDateSchema.optional(),
    updatedOn: fullDateSchema.optional(),
    tags: z
      .array(nonemptyTextSchema.max(40))
      .min(1, "must contain at least one tag")
      .max(5, "must contain no more than five tags"),
    featured: z.boolean(),
    seoTitle: nonemptyTextSchema.max(140).optional(),
    seoDescription: nonemptyTextSchema.max(320).optional(),
    coverImageAssetId: stableIdSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const normalizedTags = value.tags.map((tag) => tag.toLocaleLowerCase());
    if (new Set(normalizedTags).size !== normalizedTags.length) {
      context.addIssue({
        code: "custom",
        path: ["tags"],
        message: "must be unique without regard to case",
      });
    }
    if (value.status === "published" && value.publishedOn === undefined) {
      context.addIssue({
        code: "custom",
        path: ["publishedOn"],
        message: "is required when status is published",
      });
    }
    if (value.updatedOn !== undefined && value.publishedOn === undefined) {
      context.addIssue({
        code: "custom",
        path: ["updatedOn"],
        message: "requires publishedOn",
      });
    }
    if (
      value.updatedOn !== undefined &&
      value.publishedOn !== undefined &&
      value.updatedOn < value.publishedOn
    ) {
      context.addIssue({
        code: "custom",
        path: ["updatedOn"],
        message: "cannot precede publishedOn",
      });
    }
  });

type WritingFrontmatter = z.output<typeof writingFrontmatterSchema>;

export interface WritingSourceDiagnostic {
  readonly file: string;
  readonly field: string;
  readonly reason: string;
}

export class WritingSourceError extends Error {
  readonly diagnostics: readonly WritingSourceDiagnostic[];

  constructor(diagnostics: readonly WritingSourceDiagnostic[]) {
    super(
      `Writing source validation failed with ${String(diagnostics.length)} issue(s):\n${diagnostics
        .map(
          ({ file, field, reason }) => `[Writing ${file}] ${field}: ${reason}`,
        )
        .join("\n")}`,
    );
    this.name = "WritingSourceError";
    this.diagnostics = diagnostics;
  }
}

function sourceError(file: string, field: string, reason: string): never {
  throw new WritingSourceError([{ file, field, reason }]);
}

function errorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return undefined;
}

function splitSource(file: string, source: string) {
  if (!source.startsWith("---\n")) {
    sourceError(
      file,
      "frontmatter",
      "must begin with an exact --- delimiter followed by strict JSON",
    );
  }

  const closingDelimiter = source.indexOf("\n---\n", 4);
  if (closingDelimiter < 0) {
    sourceError(
      file,
      "frontmatter",
      "must end with an exact --- delimiter before the Markdown body",
    );
  }

  return {
    frontmatter: source.slice(4, closingDelimiter),
    body: source.slice(closingDelimiter + 5),
  };
}

function parseFrontmatter(file: string, source: string): WritingFrontmatter {
  let input: unknown;
  try {
    input = JSON.parse(source);
  } catch (error) {
    sourceError(
      file,
      "frontmatter",
      `must be valid strict JSON (${error instanceof Error ? error.message : "parse failed"})`,
    );
  }

  const result = writingFrontmatterSchema.safeParse(input);
  if (!result.success) {
    throw new WritingSourceError(
      result.error.issues.map((issue) => ({
        file,
        field:
          issue.path.length === 0
            ? "frontmatter"
            : `frontmatter.${issue.path.map(String).join(".")}`,
        reason: issue.message,
      })),
    );
  }
  return result.data;
}

interface LoadedWritingSource {
  readonly file: string;
  readonly record: WritingRecord;
  readonly headingIds: ReadonlySet<string>;
  readonly links: readonly ParsedArticleLink[];
}

function todayUtc(now: Date) {
  return now.toISOString().slice(0, 10);
}

function loadRecord(
  file: string,
  source: string,
  currentDate: Date,
): LoadedWritingSource {
  const { frontmatter: frontmatterSource, body } = splitSource(file, source);
  const frontmatter = parseFrontmatter(file, frontmatterSource);
  const expectedFile = `${frontmatter.slug}.md`;
  if (file !== expectedFile) {
    sourceError(
      file,
      "frontmatter.slug",
      `must match the source filename (${expectedFile})`,
    );
  }

  const today = todayUtc(currentDate);
  for (const [field, value] of [
    ["publishedOn", frontmatter.publishedOn],
    ["updatedOn", frontmatter.updatedOn],
  ] as const) {
    if (value !== undefined && value > today) {
      sourceError(
        file,
        `frontmatter.${field}`,
        `cannot be later than ${today}`,
      );
    }
  }

  let parsed: ReturnType<typeof parseMarkdownArticle> | undefined;
  if (body.trim().length > 0) {
    try {
      parsed = parseMarkdownArticle(body);
    } catch (error) {
      if (error instanceof MarkdownValidationError) {
        sourceError(file, error.field, error.reason);
      }
      throw error;
    }
  } else if (frontmatter.status === "published") {
    sourceError(file, "body", "is required when status is published");
  }

  const canonicalPath = `/writings/${frontmatter.slug}` as const;
  const record: WritingRecord = {
    metadata: {
      id: frontmatter.id,
      slug: frontmatter.slug,
      title: frontmatter.title,
      publicationStatus: frontmatter.status,
      summary: frontmatter.summary,
      ...(frontmatter.publishedOn === undefined
        ? {}
        : { publishedOn: frontmatter.publishedOn }),
      ...(frontmatter.updatedOn === undefined
        ? {}
        : { updatedOn: frontmatter.updatedOn }),
      tags: frontmatter.tags,
      featured: frontmatter.featured,
      ...(frontmatter.coverImageAssetId === undefined
        ? {}
        : { coverImageAssetId: frontmatter.coverImageAssetId }),
      seo: {
        title: `${frontmatter.seoTitle ?? frontmatter.title} | Rahul Yadav`,
        description: frontmatter.seoDescription ?? frontmatter.summary,
        canonicalPath,
      },
    },
    ...(parsed === undefined ? {} : { article: parsed.article }),
  };

  return {
    file,
    record,
    headingIds: parsed?.headingIds ?? new Set<string>(),
    links: parsed?.links ?? [],
  };
}

function validateUniqueSources(sources: readonly LoadedWritingSource[]) {
  for (const field of ["id", "slug"] as const) {
    const firstFileByValue = new Map<string, string>();
    for (const source of sources) {
      const value = source.record.metadata[field];
      const firstFile = firstFileByValue.get(value);
      if (firstFile !== undefined) {
        sourceError(
          source.file,
          `frontmatter.${field}`,
          `duplicates ${value} already used by ${firstFile}`,
        );
      }
      firstFileByValue.set(value, source.file);
    }
  }
}

function validateFragment(
  source: LoadedWritingSource,
  target: LoadedWritingSource,
  hash: string,
) {
  if (hash.length === 0) return;
  const fragment = hash.slice(1);
  if (!target.headingIds.has(fragment)) {
    sourceError(
      source.file,
      "body.link",
      `fragment #${fragment} does not match a heading in ${target.file}`,
    );
  }
}

function validatePublishedLinks(sources: readonly LoadedWritingSource[]) {
  const bySlug = new Map(
    sources.map((source) => [source.record.metadata.slug, source]),
  );

  for (const source of sources) {
    if (source.record.metadata.publicationStatus !== "published") continue;

    for (const { href } of source.links) {
      if (href.startsWith("#")) {
        validateFragment(source, source, href);
        continue;
      }

      const url = new URL(href, "https://rahuly.in");
      if (url.origin !== "https://rahuly.in") continue;
      const match = /^\/writings\/([^/]+)\/?$/.exec(url.pathname);
      if (match === null) continue;
      const slug = match[1];
      if (slug === undefined) continue;
      const target = bySlug.get(slug);
      if (target?.record.metadata.publicationStatus !== "published") {
        sourceError(
          source.file,
          "body.link",
          `published article links to missing or unpublished writing slug ${slug}`,
        );
      }
      validateFragment(source, target, url.hash);
    }
  }
}

export async function loadWritingSources(
  options: {
    readonly directory?: string;
    readonly currentDate?: Date;
  } = {},
): Promise<readonly WritingRecord[]> {
  const directory = options.directory ?? writingsDirectory;
  const currentDate = options.currentDate ?? new Date();
  let directoryStat;
  try {
    directoryStat = await lstat(directory);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return [];
    throw error;
  }

  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    sourceError(
      path.relative(process.cwd(), directory) || directory,
      "sourceDirectory",
      "must be a real directory and cannot be a symbolic link",
    );
  }

  const entries = (await readdir(directory, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
  const loaded: LoadedWritingSource[] = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      sourceError(entry.name, "sourceFile", "symbolic links are not allowed");
    }
    if (!entry.isFile()) {
      sourceError(
        entry.name,
        "sourceFile",
        "nested directories and special files are not allowed",
      );
    }
    if (!entry.name.endsWith(".md")) {
      sourceError(entry.name, "sourceFile", "only .md files are allowed");
    }

    const bytes = await readFile(path.join(directory, entry.name));
    let source: string;
    try {
      source = utf8Decoder.decode(bytes);
    } catch {
      sourceError(entry.name, "sourceFile", "must contain valid UTF-8 text");
    }
    loaded.push(loadRecord(entry.name, source, currentDate));
  }

  validateUniqueSources(loaded);
  validatePublishedLinks(loaded);
  return loaded.map(({ record }) => record);
}
