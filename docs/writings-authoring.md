# Writings authoring guide

Milestone 8 stores public writing sources in `content/writings`. Each article is one UTF-8 Markdown file named exactly `<slug>.md`. The directory may be absent or empty before content is approved; nested directories, symbolic links, non-Markdown entries, and filenames that do not match the validated slug are invalid.

## File structure

Every file starts with strict JSON front matter between delimiter lines, followed by Markdown:

```text
---
{
  "id": "writing-stable-id",
  "slug": "stable-url-slug",
  "title": "Article title",
  "summary": "One concise public summary.",
  "status": "draft",
  "tags": ["API design", "Testing"],
  "featured": false
}
---

Article body.
```

The front matter is parsed with `JSON.parse` and validated as unknown data with Zod. It is JSON, not YAML: quote every property name and string, use commas between properties, and do not add comments or trailing commas. Unknown fields fail validation.

## Fields

Required for every record:

- `id`: stable, unique kebab-case identifier. Do not reuse an ID after removing an article.
- `slug`: stable, unique lowercase kebab-case URL segment. It must equal the filename without `.md`.
- `title`: public article title.
- `summary`: one-sentence public description used by the index, metadata, and RSS.
- `status`: `draft`, `published`, or `archived`.
- `tags`: one to five non-empty public labels, unique without regard to case.
- `featured`: boolean editorial flag. It does not replace chronological ordering.

Conditionally required:

- `publishedOn`: ISO calendar date (`YYYY-MM-DD`) required when `status` is `published`.

Optional:

- `updatedOn`: ISO date no earlier than `publishedOn`.
- `seoTitle`: concise title override for search metadata.
- `seoDescription`: concise description override for search metadata.
- `coverImageAssetId`: validated local approved-asset reference. Milestone 8 articles do not use cover images.

Publication and update dates cannot be in the future. A published article must have a non-empty valid body. Draft and archived records are validated but excluded from public collections, routes, route data, metadata, JSON-LD, RSS, sitemap, prerendering, and browser output.

## Stable slugs and editorial order

Treat a published slug as a permanent public URL. Changing it creates a different URL and requires a separately approved redirect policy; frontend v1 does not silently add redirects. Published articles sort by `publishedOn` descending and then by slug ascending. Newer and older navigation uses the same deterministic order.

The approved initial publication schedule is one article per Monday:

| Date       | Article                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- |
| 2026-07-20 | Reducing API Payloads with Response Shaping and Compression                              |
| 2026-07-27 | Phased Application Modernization Without a Big-Bang Cutover                              |
| 2026-08-03 | Designing JWT Revocation and API Rate Limiting with Redis                                |
| 2026-08-10 | Replacing Mock-Heavy Tests with Database-Backed pytest Fixtures                          |
| 2026-08-17 | Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues |

Keep these dates unless a later editorial decision explicitly changes them.

## Supported Markdown

Milestone 8 supports:

- paragraphs;
- level-two through level-four headings;
- emphasis, strong text, and strikethrough;
- inline code;
- ordered and unordered lists;
- blockquotes and thematic breaks;
- HTTPS, root-relative, and same-page fragment links;
- fenced code blocks with an optional plain language label; and
- GitHub-flavored pipe tables.

Do not add level-one headings; the page title is the only `<h1>`. Raw HTML, `script` or `style` blocks, MDX syntax, components, images, iframes, task-list controls, and embedded executable content are rejected. HTTP, protocol-relative, `javascript:`, `data:`, `file:`, malformed, or path-traversal links are rejected. A root-relative link to another writing must resolve to a published slug, and a writing fragment must match a generated heading ID.

Headings receive deterministic kebab-case IDs. Repeated headings use `-2`, `-3`, and so on. A sticky, initially collapsed native `On this page` disclosure is displayed only when an article has at least three level-two or level-three headings. Its links and native disclosure behavior remain usable without JavaScript. Keep heading levels sequential and use headings to describe structure, not appearance.

## Code, tables, and derived values

Fenced code is escaped and rendered as plain text with its validated language label; Milestone 8 deliberately has no token-level syntax highlighter. Keep samples compact and label generic designs as simplified or illustrative. Wide code blocks scroll within their own region.

Use tables only for genuinely tabular comparisons. Header cells and captions or nearby labels must make their purpose clear. Wide tables receive their own labelled overflow region rather than forcing the page to scroll horizontally.

Reading time is derived from visible prose at 225 words per minute, rounded up with a one-minute minimum. Fenced code and link destinations do not count. Word count, canonical paths, heading IDs, table of contents, adjacent-writing links, RSS and sitemap URLs, and JSON-LD are derived; do not author them in front matter.

## Safe editing workflow

1. Start a record as `draft` and keep its stable ID and slug.
2. Write only approved public facts. Remove customer names, internal application names, proprietary workflows, private URLs or identifiers, confidential infrastructure, incidents, secrets, and unapproved metrics.
3. Describe generic examples as simplified or illustrative, never as an exact production implementation.
4. Use primary official HTTPS references only when an external source is necessary.
5. Run the focused content validation and writing tests before changing a record to `published`.
6. Review the rendered article at narrow and wide widths, 200% text, light and dark themes, forced colors, no JavaScript, and print.
7. Confirm the published route, canonical metadata, JSON-LD, RSS summary, sitemap entry, and internal links before requesting approval.

Never import source Markdown from a React component or route. All source loading, validation, parsing, and public projection goes through the asynchronous repository boundary.
