# Content approval record

Professional-content approval date: 2026-08-15

The Senior Backend Engineer and Senior Full-Stack Engineer résumé variants are private factual sources for Milestone 3. Rahul gave final approval to publish every fact contained in either source.

Compatible backend and full-stack perspectives are combined, duplicate employment records are normalized, and original ownership language and quantitative wording are preserved. No fact may be invented. Numerically ambiguous source wording is retained without reinterpretation.

Traceability uses the private review ledger ranges `IDENT-*`, `CONTACT-*`, `EMP-*`, `ROLE-*`, `RESP-*`, `TECH-*`, `METRIC-*`, `SKILL-*`, `EDU-*`, `LINK-*`, `CONFLICT-*`, and `CONFIDENTIAL-*`. Private comparisons, extraction details, and source locations are intentionally excluded from this record.

The following implementation gates are complete:

- The approved downloadable résumé artifact was published in Milestone 5.
- The approved profile photograph and responsive local derivatives were published after the Milestone 4 design gate.
- The local Markdown engine and five approved articles were completed and published in Milestone 8.

The private résumé variants, extracted text, comparison notes, and render references remain ignored and untracked factual sources. Approval of the public derivative does not authorize publication of those private artifacts.

## Milestone 7 project-roadmap approval

Approval date: 2026-08-17

Rahul approved the four public WIP project records for Tourney, URL Shortener, Portfolio Tracker, and Universal Job Tracker, including their editorial order, summaries, planned destinations, planned capabilities, planned stacks, stack rationales, later possibilities, and Portfolio Tracker disclaimer.

Development has not started on these products. Their public presentation must distinguish intended direction from shipped functionality, keep planned destinations non-interactive while status is WIP, and avoid invented progress, outcomes, repositories, deployment claims, or delivery dates.

## Milestone 8 writings approval

Approval date: 2026-08-17

Rahul approved a single combined Writings milestone covering the local Markdown engine, five initial articles, editorial index and detail presentation, metadata, `Article` JSON-LD, summary-only RSS, sitemap integration, static verification, accessibility, responsive behavior, print behavior, and visual review. The former Writings Engine and Initial Writings Content milestones are merged; there is no separate Milestone 9 content phase.

The approved source architecture uses one local plain-Markdown file per stable slug, strict JSON front matter, `markdown-it` for build-time parsing, a safe serializable article tree, and the existing asynchronous `ContentRepository`. MDX, raw HTML, token-level syntax highlighting, runtime Markdown parsing, a CMS, a backend, and a future-content-API article are not approved.

Rahul approved these five topics and authorized Codex to draft their complete initial articles for later editorial review:

1. Phased Application Modernization Without a Big-Bang Cutover.
2. Reducing API Payloads with Response Shaping and Compression.
3. Replacing Mock-Heavy Tests with Database-Backed pytest Fixtures.
4. Designing JWT Revocation and API Rate Limiting with Redis.
5. Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues.

The five initial records publish on consecutive Mondays in reverse-chronological editorial order: Reducing API Payloads with Response Shaping and Compression on 2026-07-20; Phased Application Modernization Without a Big-Bang Cutover on 2026-07-27; Designing JWT Revocation and API Rate Limiting with Redis on 2026-08-03; Replacing Mock-Heavy Tests with Database-Backed pytest Fixtures on 2026-08-10; and Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues on 2026-08-17. All retain `featured` set to `false`.

Rahul approved one consistent date-above-title index layout at every viewport, full-parent-width Writings text, a restrained Writings-specific heading scale, subtly tinted light-mode code and table surfaces, and a sticky native `On this page` disclosure. The disclosure is collapsed initially, remains usable without JavaScript, and progressively enhances outside-click dismissal, Escape focus restoration, and focused anchor navigation.

The authorization does not extend to customer or client names, internal application names, private repositories, internal URLs or identifiers, proprietary workflows, confidential infrastructure or topology, secrets, incidents, unapproved metrics, or claims of sole ownership. Examples must be original, generic, and identified as simplified or illustrative rather than represented as exact production implementations.

Rahul subsequently approved the complete text of all five articles, their summaries, tags, dates, order, and public presentation. All five are published; neither article creation nor the writings engine remains pending Milestone 9 work.

## Milestone 9 SEO, accessibility, and performance policy

Approval date: 2026-08-18

Rahul approved `https://rahuly.in` as the exact canonical origin, the home trailing slash, no trailing slash on other known routes, and exclusion of query strings and fragments. Unknown routes and the SPA fallback use exact `noindex,follow` with no canonical, social URL, feed discovery, or structured data. The four WIP project details retain self-canonicals, exact `noindex,follow`, and their existing crawlable internal “View project plan” links, but are excluded from the sitemap; planned external destinations remain non-interactive.

The sitemap contains exactly home, the project index, the writings index, and the five published articles. Only article URLs receive `lastmod`, derived from `updatedOn ?? publishedOn`. RSS contains the same five published articles, and root `robots.txt` allows crawling and references the sitemap.

Rahul approved factual text-only Open Graph and Twitter metadata without handles or images. Home may emit `WebSite` and `ProfilePage` with a minimal nested `Person`; the writings index may emit `CollectionPage` with the five visible writings in an ordered `ItemList`; writing details retain factual `Article` and add a `BreadcrumbList` matching the visible path. WIP project details, unknown routes, and the fallback emit no structured data.

The approved home page remains unchanged and Recent writings is deferred. A social-preview image, favicon, web manifest, Google verification, Search Console, analytics, tagging, advertising, consent tooling, deployment, DNS, release, and Milestone 10 are not part of Milestone 9.
