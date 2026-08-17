import MarkdownIt, { type Token } from "markdown-it";

import type {
  ArticleBlockNode,
  ArticleContent,
  ArticleInlineNode,
  ArticleTableOfContentsItem,
} from "../domain/content";

const languagePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const unsafeEncodedPathPattern = /%(?:2e|2f|5c)/i;
const taskListPattern = /^\s*[-+*]\s+\[[ xX]\]\s+/m;
const standaloneMdxExpressionPattern = /(?:^|\n)\s*\{[^{}\n]+\}\s*(?=\n|$)/;

export interface ParsedArticleLink {
  readonly href: string;
}

export interface ParsedArticle {
  readonly article: ArticleContent;
  readonly headingIds: ReadonlySet<string>;
  readonly links: readonly ParsedArticleLink[];
}

export class MarkdownValidationError extends Error {
  constructor(
    readonly field: string,
    readonly reason: string,
  ) {
    super(`${field}: ${reason}`);
    this.name = "MarkdownValidationError";
  }
}

function fail(field: string, reason: string): never {
  throw new MarkdownValidationError(field, reason);
}

function withoutFencedCode(markdown: string) {
  const lines = markdown.split("\n");
  const visible: string[] = [];
  let fence: "```" | "~~~" | undefined;

  for (const line of lines) {
    const marker = /^\s*(```+|~~~+)/.exec(line)?.[1];
    if (fence === undefined && marker !== undefined) {
      fence = marker.startsWith("`") ? "```" : "~~~";
      visible.push("");
      continue;
    }
    if (fence !== undefined && marker?.startsWith(fence[0] ?? "") === true) {
      fence = undefined;
      visible.push("");
      continue;
    }
    visible.push(fence === undefined ? line : "");
  }

  return visible.join("\n");
}

function validateSourceSyntax(markdown: string, tokens: readonly Token[]) {
  const proseSource = withoutFencedCode(markdown);

  if (taskListPattern.test(proseSource)) {
    fail("body", "task-list controls are not supported");
  }
  if (standaloneMdxExpressionPattern.test(proseSource)) {
    fail("body", "MDX expressions and executable components are not supported");
  }

  const visit = (items: readonly Token[]) => {
    for (const token of items) {
      if (token.type === "html_block" || token.type === "html_inline") {
        fail(
          "body",
          "raw HTML, scripts, styles, iframes, and MDX are not allowed",
        );
      }
      if (token.type === "image") {
        fail("body", "Markdown images are not supported in Milestone 8");
      }
      if (token.type === "code_block") {
        fail(
          "body",
          "indent-based code blocks are not supported; use a fenced block",
        );
      }
      if (token.children !== null) visit(token.children);
    }
  };

  visit(tokens);
}

function safeLink(href: string) {
  if (
    href.length === 0 ||
    href !== href.trim() ||
    href.includes("\\") ||
    unsafeEncodedPathPattern.test(href)
  ) {
    return false;
  }

  if (href.startsWith("#")) {
    return /^#[a-z0-9]+(?:-[a-z0-9]+)*$/.test(href);
  }

  if (href.startsWith("/")) {
    if (href.startsWith("//")) return false;

    try {
      const authoredPath = decodeURIComponent(href.split(/[?#]/, 1)[0] ?? "");
      if (
        authoredPath
          .split("/")
          .some((segment) => segment === "." || segment === "..")
      ) {
        return false;
      }
      const url = new URL(href, "https://internal.invalid");
      const decodedSegments = decodeURIComponent(url.pathname).split("/");
      return (
        url.origin === "https://internal.invalid" &&
        !decodedSegments.some((segment) => segment === "." || segment === "..")
      );
    } catch {
      return false;
    }
  }

  try {
    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      !href.startsWith("//")
    );
  } catch {
    return false;
  }
}

function inlinePlainText(nodes: readonly ArticleInlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case "text":
        case "inline-code":
          return node.value;
        case "line-break":
          return " ";
        case "emphasis":
        case "strong":
        case "strikethrough":
        case "link":
          return inlinePlainText(node.children);
      }
    })
    .join("")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function headingSlug(value: string) {
  const slug = value
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

  if (slug.length === 0) {
    fail("body.heading", "heading text must produce a stable URL-safe ID");
  }
  return slug;
}

class InlineCursor {
  private index = 0;

  constructor(
    private readonly tokens: readonly Token[],
    private readonly links: ParsedArticleLink[],
  ) {}

  parse(stopType?: string): readonly ArticleInlineNode[] {
    const nodes: ArticleInlineNode[] = [];

    while (this.index < this.tokens.length) {
      const token = this.tokens[this.index];
      if (token === undefined) break;
      if (stopType !== undefined && token.type === stopType) {
        this.index += 1;
        return nodes;
      }

      this.index += 1;
      switch (token.type) {
        case "text":
          if (token.content.length > 0) {
            nodes.push({ kind: "text", value: token.content });
          }
          break;
        case "softbreak":
          nodes.push({ kind: "text", value: " " });
          break;
        case "hardbreak":
          nodes.push({ kind: "line-break" });
          break;
        case "code_inline":
          if (token.content.length === 0) {
            fail("body.inlineCode", "inline code cannot be empty");
          }
          nodes.push({ kind: "inline-code", value: token.content });
          break;
        case "em_open": {
          const children = this.parse("em_close");
          if (children.length === 0)
            fail("body.emphasis", "emphasis cannot be empty");
          nodes.push({ kind: "emphasis", children });
          break;
        }
        case "strong_open": {
          const children = this.parse("strong_close");
          if (children.length === 0)
            fail("body.strong", "strong text cannot be empty");
          nodes.push({ kind: "strong", children });
          break;
        }
        case "s_open": {
          const children = this.parse("s_close");
          if (children.length === 0)
            fail("body.strikethrough", "strikethrough cannot be empty");
          nodes.push({ kind: "strikethrough", children });
          break;
        }
        case "link_open": {
          const rawHref = token.attrGet("href");
          if (typeof rawHref !== "string" || !safeLink(rawHref)) {
            fail(
              "body.link",
              `unsafe or unsupported link destination: ${String(rawHref)}`,
            );
          }
          const children = this.parse("link_close");
          if (children.length === 0)
            fail("body.link", "link text cannot be empty");
          this.links.push({ href: rawHref });
          nodes.push({
            kind: "link",
            href: rawHref,
            external: rawHref.startsWith("https://"),
            children,
          });
          break;
        }
        default:
          fail("body", `unsupported inline Markdown token: ${token.type}`);
      }
    }

    if (stopType !== undefined) {
      fail("body", `unclosed inline Markdown token; expected ${stopType}`);
    }
    return nodes;
  }
}

function parseInline(token: Token, links: ParsedArticleLink[]) {
  if (token.type !== "inline" || token.children === null) {
    fail("body", "expected inline Markdown content");
  }
  const nodes = new InlineCursor(token.children, links).parse();
  if (nodes.length === 0)
    fail("body", "inline Markdown content cannot be empty");
  return nodes;
}

class BlockCursor {
  private index = 0;
  private readonly headingCounts = new Map<string, number>();
  readonly headings: ArticleTableOfContentsItem[] = [];
  readonly headingIds = new Set<string>();
  readonly links: ParsedArticleLink[] = [];

  constructor(private readonly tokens: readonly Token[]) {}

  private current() {
    return this.tokens[this.index];
  }

  private take(expectedType: string) {
    const token = this.current();
    if (token?.type !== expectedType) {
      fail(
        "body",
        `expected ${expectedType}, received ${token?.type ?? "end of document"}`,
      );
    }
    this.index += 1;
    return token;
  }

  private heading(token: Token): ArticleBlockNode {
    const level = Number(token.tag.slice(1));
    if (level === 1) {
      fail(
        "body.heading",
        "level-one headings are not allowed; the article title is the page h1",
      );
    }
    if (level !== 2 && level !== 3 && level !== 4) {
      fail(
        "body.heading",
        "only level-two through level-four headings are supported",
      );
    }

    const children = parseInline(this.take("inline"), this.links);
    this.take("heading_close");
    const text = inlinePlainText(children);
    if (text.length === 0) fail("body.heading", "heading text cannot be empty");
    const base = headingSlug(text);
    const count = (this.headingCounts.get(base) ?? 0) + 1;
    this.headingCounts.set(base, count);
    const id = count === 1 ? base : `${base}-${String(count)}`;
    this.headingIds.add(id);
    if (level === 2 || level === 3) this.headings.push({ id, level, text });
    return { kind: "heading", level, id, text, children };
  }

  private list(openToken: Token): ArticleBlockNode {
    const ordered = openToken.type === "ordered_list_open";
    const closeType = ordered ? "ordered_list_close" : "bullet_list_close";
    const startAttribute = ordered ? openToken.attrGet("start") : null;
    const start =
      typeof startAttribute === "number"
        ? startAttribute
        : typeof startAttribute === "string"
          ? Number(startAttribute)
          : undefined;
    const items: (readonly ArticleBlockNode[])[] = [];

    while (this.current()?.type === "list_item_open") {
      this.take("list_item_open");
      const blocks = this.parse(new Set(["list_item_close"]));
      this.take("list_item_close");
      if (blocks.length === 0) fail("body.list", "list items cannot be empty");
      items.push(blocks);
    }
    this.take(closeType);
    if (items.length === 0) fail("body.list", "lists cannot be empty");

    return {
      kind: "list",
      ordered,
      ...(ordered && start !== undefined && start !== 1 ? { start } : {}),
      items,
    };
  }

  private tableRow(cellType: "th" | "td") {
    this.take("tr_open");
    const cells: (readonly ArticleInlineNode[])[] = [];
    while (this.current()?.type === `${cellType}_open`) {
      this.take(`${cellType}_open`);
      cells.push(parseInline(this.take("inline"), this.links));
      this.take(`${cellType}_close`);
    }
    this.take("tr_close");
    return cells;
  }

  private table(): ArticleBlockNode {
    this.take("thead_open");
    const headings = this.tableRow("th");
    this.take("thead_close");
    this.take("tbody_open");
    const rows: (readonly (readonly ArticleInlineNode[])[])[] = [];
    while (this.current()?.type === "tr_open") rows.push(this.tableRow("td"));
    this.take("tbody_close");
    this.take("table_close");

    if (headings.length === 0)
      fail("body.table", "tables require a header row");
    if (rows.some((row) => row.length !== headings.length)) {
      fail("body.table", "every table row must match the header column count");
    }
    const label = `Table: ${headings.map(inlinePlainText).join(", ")}`;
    return { kind: "table", label, headings, rows };
  }

  parse(stopTypes = new Set<string>()): readonly ArticleBlockNode[] {
    const blocks: ArticleBlockNode[] = [];

    while (this.index < this.tokens.length) {
      const token = this.current();
      if (token === undefined || stopTypes.has(token.type)) break;
      this.index += 1;

      switch (token.type) {
        case "paragraph_open": {
          const children = parseInline(this.take("inline"), this.links);
          this.take("paragraph_close");
          blocks.push({ kind: "paragraph", children });
          break;
        }
        case "heading_open":
          blocks.push(this.heading(token));
          break;
        case "bullet_list_open":
        case "ordered_list_open":
          blocks.push(this.list(token));
          break;
        case "blockquote_open": {
          const children = this.parse(new Set(["blockquote_close"]));
          this.take("blockquote_close");
          if (children.length === 0)
            fail("body.blockquote", "blockquotes cannot be empty");
          blocks.push({ kind: "blockquote", children });
          break;
        }
        case "hr":
          blocks.push({ kind: "thematic-break" });
          break;
        case "fence": {
          const info = token.info.trim();
          if (info.length > 0 && !languagePattern.test(info)) {
            fail(
              "body.codeBlock.language",
              "language labels must be lowercase kebab-case without attributes",
            );
          }
          if (token.content.length === 0)
            fail("body.codeBlock", "fenced code blocks cannot be empty");
          blocks.push({
            kind: "code-block",
            ...(info.length === 0 ? {} : { language: info }),
            code: token.content,
          });
          break;
        }
        case "table_open":
          blocks.push(this.table());
          break;
        default:
          fail("body", `unsupported block Markdown token: ${token.type}`);
      }
    }

    return blocks;
  }
}

function blockVisibleText(block: ArticleBlockNode): string {
  switch (block.kind) {
    case "paragraph":
    case "heading":
      return inlinePlainText(block.children);
    case "list":
      return block.items
        .flatMap((item) => item.map(blockVisibleText))
        .join(" ");
    case "blockquote":
      return block.children.map(blockVisibleText).join(" ");
    case "table":
      return [...block.headings, ...block.rows.flat()]
        .map(inlinePlainText)
        .join(" ");
    case "thematic-break":
    case "code-block":
      return "";
  }
}

function countWords(blocks: readonly ArticleBlockNode[]) {
  const visibleText = blocks.map(blockVisibleText).join(" ");
  return (
    visibleText.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0
  );
}

export function parseMarkdownArticle(markdown: string): ParsedArticle {
  if (markdown.length === 0 || markdown.trim().length === 0) {
    fail("body", "published article body cannot be empty");
  }

  const parser = new MarkdownIt({
    html: true,
    linkify: false,
    typographer: false,
    breaks: false,
  });
  parser.validateLink = () => true;
  parser.normalizeLink = (url) => url;
  const tokens = parser.parse(markdown, {});
  validateSourceSyntax(markdown, tokens);

  const cursor = new BlockCursor(tokens);
  const blocks = cursor.parse();
  if (blocks.length === 0)
    fail("body", "article body must contain visible Markdown content");
  const wordCount = countWords(blocks);

  return {
    article: {
      format: "article-tree",
      blocks,
      tableOfContents: cursor.headings,
      wordCount,
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 225)),
    },
    headingIds: cursor.headingIds,
    links: cursor.links,
  };
}
