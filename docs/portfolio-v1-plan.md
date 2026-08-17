# Portfolio Frontend v1 Product and Architecture Plan

This document is the product and architecture source of truth for Rahul Yadav's static portfolio frontend v1. Use it to plan milestones, evaluate implementation decisions, and review acceptance. Keep milestone work within the stated sequence and exclusions.

## Purpose and Target Audience

Create Rahul Yadav's complete personal portfolio for `rahuly.in`. Present Rahul as a senior backend and backend-leaning full-stack engineer with approximately six years of software engineering experience.

Serve these primary audiences:

- Recruiters screening for role and experience fit.
- Engineering leaders and hiring managers evaluating technical depth, impact, judgment, and leadership.
- Collaborators considering Rahul for engineering work.
- Developers exploring Rahul's projects and technical writing.

Communicate:

- Professional identity and engineering focus.
- Backend, API, system-design, cloud, migration, performance, testing, and technical-leadership experience.
- Professional work history, technical skills, and education.
- Selected projects presented as credible case studies.
- Experience-based technical writing.
- Approved contact paths and social links.
- An approved downloadable résumé.

Make the portfolio easy to scan while allowing progressive disclosure into project and writing detail pages. Do not turn the home page into an unedited résumé dump.

## Frontend v1 Scope

Frontend v1 is a complete, statically generated public portfolio. It includes:

- A root-level React application that replaces the temporary legacy application during the approved migration milestone.
- Static pre-rendering of every known route, project slug, and published writing slug.
- A complete overview on the home page with deeper project and writing routes.
- Locally stored, typed, validated content behind an asynchronous repository boundary.
- A new responsive visual design with an approved local design system.
- Light, dark, and system themes with persisted preference and no visible incorrect-theme flash.
- Accessible navigation, content, interactions, errors, and not-found behavior.
- Local project and article media when explicitly approved.
- Plain Markdown technical writings.
- Search metadata, structured data, sitemap, RSS, and robots directives appropriate to a static portfolio.
- Automated and manual quality checks covering content, behavior, accessibility, static output, and production builds.
- GitHub Actions for frontend quality checks.

Use the following approved target technology:

- React.
- React Router Framework Mode.
- Vite.
- Strict TypeScript.
- Static pre-rendering with no runtime frontend application server.
- Tailwind CSS through its current supported Vite integration.
- Semantic CSS custom properties for design tokens.
- Zod for content-boundary validation.
- Plain Markdown for writings; do not use MDX.
- Vitest and Testing Library.
- Playwright.
- axe accessibility testing.
- npm as the package manager.
- GitHub Actions for quality checks.

During the React migration, select the latest stable mutually compatible versions available at that time and verify compatibility against official documentation.

## Explicit Exclusions

Do not include these in frontend v1:

- Deployment configuration or production hosting automation.
- AWS configuration, AWS MCP use, or cloud-resource provisioning.
- Domain or DNS changes.
- Deployment-specific rewrite rules.
- A backend repository, backend service, or API implementation.
- A database or database schema.
- Authentication or a shared user-auth service.
- An admin panel or CMS.
- Analytics or tracking.
- Comments or a newsletter.
- A working contact-form backend or unapproved external form service.
- EC2 architecture or any production infrastructure.

Do not add Redux, Zustand, a server-state or query cache, MDX, a CMS SDK, a network API, a backend client, authentication, a component library that prevents ownership of the design, or a heavy animation library unless a later requirement demonstrates a real need and Rahul explicitly approves it.

Complete and tag the static frontend before discussing excluded backend or deployment work.

## Current Application State and Migration Boundary

Milestone 2 replaced the historical Quasar/Vue application with the approved root-level React Router Framework Mode application. The production build is statically pre-rendered under `build/client`, uses npm as its package manager, and requires no runtime frontend application server. The former Vue, Quasar, Pinia, Yarn, and legacy presentation conventions are historical only and must not be restored.

Milestones 3 through 8 subsequently established the validated asynchronous content repository, approved editorial-engineering design system, site shell and home content, professional experience, the four approved WIP project records and routes, and the complete local writings engine with five approved published articles. The implementation now present on `main` is authoritative where it completes those accepted milestones; the inventory and milestone descriptions below are reconciled to that state rather than treating earlier planning assumptions as current facts.

## Target Frontend Architecture

### Approved Technology

Build the frontend with React, React Router Framework Mode, Vite, and strict TypeScript. Integrate Tailwind CSS using its current supported Vite integration, and express durable design decisions as semantic CSS custom properties rather than scattering raw presentation values through components.

Use Zod at the content boundary, plain Markdown for article bodies, Vitest and Testing Library for local automated tests, Playwright for browser behavior, axe for automated accessibility checks, npm for dependency and script management, and GitHub Actions for continuous quality checks.

### Static Rendering

Generate deployable static files. Do not require a runtime frontend application server. Pre-render all known public routes and all validated public project and writing slugs at build time.

Exclude drafts from production output. Make invalid public content a build failure. Avoid unnecessary runtime content parsing and client JavaScript. Use route-level code splitting where supported without compromising static pre-rendering.

Keep deployment-specific fallback and rewrite behavior out of frontend v1. Verify generated route artifacts and accessible not-found behavior locally; define hosting rewrites only during a later deployment phase.

### Route Map

| Route | Purpose | Static behavior |
| --- | --- | --- |
| `/` | Complete portfolio overview | Pre-rendered |
| `/projects` | Project index | Pre-rendered |
| `/projects/:slug` | Validated project case study | One pre-rendered route per public project slug |
| `/writings` | Published writing index | Pre-rendered |
| `/writings/:slug` | Published technical article | One pre-rendered route per published writing slug |
| `/rss.xml` | Summary-only feed for the five published writings | Generated XML resource |
| `/sitemap.xml` | Indexable canonical route inventory | Generated XML resource |
| `/robots.txt` | Public crawl policy and sitemap discovery | Copied root text resource |
| Not-found experience | Accessible response for unknown routes and invalid slugs | Included in static output and verified for direct navigation |

Give every known HTML route one clear page-level heading, useful metadata, a canonical URL, and meaningful empty or invalid states. Unknown routes and the SPA fallback are deliberate canonical exceptions: they use `noindex,follow` without a canonical URL, social URL, feed discovery, or structured data. Make direct static-route refreshes part of browser verification.

The approved production inventory after Milestone 9 is exactly 12 HTML routes, 14 route-data files, two XML resources, one SPA fallback, one root `robots.txt` resource, and 20 public media assets. The sitemap contains eight URLs: home, the project index, the writings index, and five published writing details.

### Application Layers and Boundaries

Separate the frontend into these conceptual layers:

1. **Domain:** Framework-independent records and content rules.
2. **Validation:** Zod schemas, cross-record checks, and public-content eligibility.
3. **Content access:** The asynchronous `ContentRepository` contract and its implementations.
4. **Routing:** Route loaders or equivalent route integration that obtains domain data through the repository.
5. **Presentation:** React components that receive typed data and do not know how raw content is stored.
6. **Build output:** Static route generation, metadata, RSS, sitemap, and validated public assets.

Keep presentation components independent of storage. Do not import raw JSON or Markdown from React components or route modules. Do not put future transport concerns into domain types.

### Future Compatibility

Use `StaticContentRepository` in frontend v1. Keep its public contract asynchronous so a later `ApiContentRepository` can satisfy the same use cases without redesigning presentation components.

Defer the backend, API protocol, database schema, authentication, administration, caching, and mutation design. Do not add placeholder network calls or a speculative backend client. The boundary is required; the future implementation is not.

## Portfolio Information Architecture

### Home Page Sections

The home page eventually includes:

1. Accessible responsive navigation.
2. Hero with Rahul's name and professional positioning.
3. Short professional introduction.
4. Primary calls to action.
5. About section.
6. Key impact or credibility highlights.
7. Featured experience.
8. Professional experience timeline.
9. Skill groups.
10. Education.
11. Featured projects.
12. Recent writings (deferred; not part of the approved frontend-v1 home implementation).
13. Contact section.
14. Social links.
15. Approved résumé download.
16. Footer.

Keep the overview web-readable. Use clear hierarchy and progressive disclosure so detail pages carry long-form project and writing information.

### Projects and Case Studies

Provide:

- A featured-project section on the home page.
- A `/projects` index.
- A pre-rendered detail route for each approved project slug.
- Related-project navigation where useful.
- Project metadata, with project entity structured data deferred until visible factual content and page purpose support it.
- Approved screenshots or intentional fallback visuals when screenshots are unavailable.

Support these project fields:

- Stable ID and validated slug.
- Title, summary, and display order.
- Project status.
- Problem.
- Rahul's role.
- Approach and architecture.
- Important decisions.
- Technical stack.
- Outcomes.
- Public links.
- Approved screenshots with meaningful alternative text.
- Featured state, SEO overrides, and related-project references where useful.

The approved initial project set is:

- Tourney — planned destination <https://tourney.rahuly.in>
- URL Shortener — planned destination <https://go.rahuly.in>
- Portfolio Tracker — planned destination <https://invest.rahuly.in>
- Universal Job Tracker — planned destination <https://jobs.rahuly.in>

All four records are work in progress. Their presentation distinguishes intended direction from shipped functionality, keeps planned destinations non-interactive, and does not invent progress, users, traffic, revenue, testimonials, metrics, repositories, deployment claims, outcomes, or delivery dates.

Internal project-card links labelled “View project plan” are intentionally retained so the approved WIP detail pages remain discoverable to readers and crawlers. Only the planned external application destinations remain non-interactive. While every project remains WIP, project-detail pages are self-canonical with `noindex,follow`, are excluded from the sitemap, and emit no project entity structured data.

### Writings

Provide:

- A `/writings` index and pre-rendered `/writings/:slug` routes.
- Production draft exclusion and reverse publication-date ordering.
- Tags and lightweight accessible search or filtering only if it materially improves navigation.
- Derived reading time.
- A sticky, initially collapsed native table-of-contents disclosure and stable heading anchors, progressively enhanced with dismissal and focus management while remaining usable without JavaScript.
- Safely escaped, language-labelled responsive code blocks and accessible copy-code controls without token-level syntax highlighting.
- Responsive tables.
- Previous and next article navigation.
- Related internal links.
- Article metadata, canonical URLs, and Article structured data.
- RSS and sitemap integration.
- Accessible empty and invalid-slug states.

Use plain Markdown. Do not use MDX. Do not allow arbitrary scripts, unsafe HTML, or embedded executable components in rendered Markdown.

### Contact Behavior

Do not present a fake working contact form. Use only approved contact actions, which may include:

- Email and a copy-email action.
- GitHub.
- LinkedIn.
- An approved résumé download.
- Approved project links.
- Phone behavior only if Rahul explicitly chooses to publish a phone number.

Add a real form only after a backend or an approved external form service receives its own design and approval.

## Content Architecture

### Domain Records and Validation

Model content as typed domain records rather than component-specific props or scattered literals. The domain should cover, as needed:

- Site identity, professional introduction, and SEO defaults.
- Experience entries and credibility highlights.
- Skill groups.
- Education entries.
- Projects and related project references.
- Writing metadata and parsed article content.
- Contact and social links.
- Approved résumé and image assets.

Require:

- Stable IDs.
- URL-safe slugs for routed content.
- ISO-formatted dates.
- Explicit display ordering where editorial order matters.
- Validated absolute or approved internal URLs.
- Explicit public, draft, or status fields where applicable.
- Duplicate ID and duplicate slug detection across the relevant collection.
- Referential-integrity checks for related records.
- Build failure for invalid public content.

Keep SEO metadata derived from or validated alongside the same source used for visible content. Do not maintain a second, contradictory factual source for metadata.

### `ContentRepository` Boundary

Define an asynchronous `ContentRepository` interface around portfolio use cases, including retrieval of the portfolio overview, project collections and slugs, published writing collections and slugs, and individual project or writing records.

Use `StaticContentRepository` for frontend v1. It may read validated local structured content and processed Markdown through build-safe adapters, but it must return typed domain records rather than expose storage formats.

Reserve `ApiContentRepository` for a later backend phase. Keep repository consumers substitutable so selecting the API implementation later does not change route presentation or reusable UI components.

React components and route modules must not import raw JSON or Markdown files directly. Route integrations must ask the repository for data and handle typed missing-content outcomes.

### Validation and Build Flow

At build time:

1. Load local source content through content adapters.
2. Parse records with Zod.
3. Normalize only explicitly safe derived values.
4. Check IDs, slugs, dates, URLs, ordering, statuses, references, and asset metadata.
5. Detect duplicate IDs and slugs.
6. Exclude drafts from production collections and route generation.
7. Derive safe article data such as reading time and heading anchors.
8. Generate the known route list, metadata, sitemap entries, and RSS items from validated records.
9. Fail the production build with actionable diagnostics if public content is invalid.

Do not silently repair factual conflicts or publish partially valid records.

### Résumé, Privacy, and Factual Accuracy

Milestone 3 received two private résumé PDFs as factual sources:

- A senior backend engineer résumé.
- A senior full-stack engineer résumé.

That source-review gate is complete. The private sources and extracted review artifacts remain ignored and untracked under `references/private/`, while the specifically approved public résumé is a local public asset. Never commit or expose the private source résumés.

When the sources are provided:

- Treat them as factual source material, not permission to publish every field.
- Merge complementary perspectives without duplicating the same employment.
- Flag conflicting titles, dates, technologies, links, metrics, or claims.
- Ask Rahul to resolve conflicts; never resolve them silently.
- Never invent, embellish, or extrapolate facts.
- Exclude confidential employer and customer information.
- Require explicit approval for public email, phone, address, résumé download, project claims, and employment metrics.
- Publish only the specifically approved public résumé artifact.

Do not place actual résumé facts or unapproved personal data in planning documents, fixtures, examples, or tests.

### Asset and Profile-Photo Policy

Rahul supplied and approved the current profile photograph after the design-system gate. Its local responsive derivatives are approved public assets; the legacy remote avatar remains historical and must not be restored or used automatically.

For every approved public image:

- Store it locally; never hotlink it.
- Confirm public-use approval.
- Remove unnecessary metadata.
- Provide meaningful alt text, or mark genuinely decorative images appropriately.
- Declare intrinsic dimensions.
- Generate responsive sizes and modern formats where practical.
- Avoid layout shift and wasteful downloads.

Use screenshots only with approval and without confidential or private data. Provide an intentional design-system fallback when a project has no screenshot.

### Markdown Writings Strategy

Store frontend-v1 article bodies in local plain Markdown files. Keep metadata validated separately or in a constrained front-matter format selected during the writings milestone. Do not use MDX.

Validate this planned writing metadata:

- Stable ID.
- Slug.
- Title.
- Summary.
- Publication date.
- Optional updated date.
- Draft or published status.
- Tags.
- Featured flag.
- Optional local cover image and alt text.
- Optional SEO overrides.

Convert Markdown into a safe, typed article representation behind `StaticContentRepository`. Sanitize or reject unsafe HTML and arbitrary executable content. Keep the body and metadata model suitable for later storage and return through `ApiContentRepository` without changing article presentation.

The approved initial writing set is:

1. Phased Application Modernization Without a Big-Bang Cutover.
2. Reducing API Payloads with Response Shaping and Compression.
3. Replacing Mock-Heavy Tests with Database-Backed pytest Fixtures.
4. Designing JWT Revocation and API Rate Limiting with Redis.
5. Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues.

Rahul approved these five experience-derived topics and authorized Codex to draft their complete initial text for editorial review. The drafts must remain generic, distinguish illustrative designs from exact production facts, and exclude customer names, internal application names, proprietary workflows, confidential infrastructure, and unapproved metrics. The previously proposed future-content-API article is explicitly rejected and is not part of frontend v1.

## Design Direction

### Editorial-Engineering Visual Direction

Create a distinctive, polished, modern editorial-engineering portfolio from scratch. Communicate the confidence, clarity, and technical judgment expected from a senior software engineer.

Use:

- Strong, readable typography.
- Generous whitespace.
- A precise responsive grid.
- Restrained accent colors.
- Semantic design tokens.
- Subtle depth.
- Purposeful motion.
- Clear visual hierarchy.
- Cohesive light and dark themes.
- High-quality article typography.
- Consistent project case-study presentation.

Avoid:

- A generic portfolio-template appearance.
- Excessive gradients or decorative gradient blobs.
- Permanent glassmorphism.
- Unnecessary card grids.
- Tiny text.
- Generic developer illustrations.
- Fake terminal interfaces used only as decoration.
- Excessive animation or motion that competes with content.
- Effects that reduce contrast or readability.

### Complete-New-UI and Legacy No-Reuse Rule

Do not port, imitate, translate, preserve, or recreate the legacy application's:

- Page layout or navigation.
- Colors or typography.
- Spacing or visual rhythm.
- Component composition or cards.
- CSS or Quasar components.
- Animations.
- Visual hierarchy.
- Responsive behavior.

Do not rebuild the old UI in React. Reusing a verified fact, approved link, or separately approved asset never authorizes reuse of its presentation.

### React Foundation Gate

Keep milestone 2, React foundation and CI, intentionally visually minimal. Establish only the technical shell, static route capability, essential semantic structure, and minimal styling required to test the foundation. Do not silently establish final colors, typography, spacing, components, animation, or visual hierarchy during migration.

### Design-System Approval Gate

In milestone 4, define and obtain approval for:

- Color tokens.
- Typography tokens.
- Spacing tokens.
- Radius tokens.
- Border tokens.
- Shadow tokens.
- Motion tokens.
- Layout tokens.
- Responsive breakpoints.
- Theme handling.
- Focus treatment.
- Reusable UI primitives.
- Representative component previews.

Likely primitives include `Button`, `LinkButton`, `Container`, `Section`, `SectionHeading`, `Card`, `Badge`, `IconButton`, `ThemeToggle`, `SkipLink`, and `VisuallyHidden`.

Review the design-system preview before applying its styles across the portfolio. After approval, use only the new system for every route and section. Expose a clean local public API, but do not create a separate shared package in frontend v1. Consider extraction only after another application proves the abstraction.

### Themes and Motion

Support light, dark, and system theme modes. Persist explicit user preference and apply the effective theme before first paint to avoid a visible flash of the incorrect theme.

Respect `prefers-reduced-motion`. Keep transitions purposeful, interruptible where relevant, and secondary to comprehension. Do not introduce a heavy animation library without explicit approval and demonstrated need.

## Accessibility and Responsive Requirements

Meet these requirements across all routes and states:

- Use semantic HTML and appropriate landmarks.
- Provide one clear page-level heading and a logical heading hierarchy.
- Prefer native interactive elements.
- Make every interaction keyboard operable.
- Provide visible, consistent focus treatment.
- Give controls accessible names and understandable states.
- Provide a skip link.
- Use meaningful alt text and correct decorative-image handling.
- Maintain sufficient text, control, focus, and theme contrast.
- Respect reduced-motion preferences.
- Use touch-friendly targets.
- Make menus, disclosures, errors, empty states, and not-found states accessible.
- Preserve reading and operation at 200% zoom.
- Prevent horizontal overflow.
- Design mobile-first and verify mobile, tablet, laptop, and wide-desktop layouts.
- Keep code blocks, tables, navigation, and long-form articles usable on narrow viewports.

Use axe checks on representative routes and interaction states. Supplement automation with manual keyboard navigation, focus-order review, zoom review, contrast review, theme review, and visual inspection.

## SEO and Structured Data

Generate SEO data from the same validated content source used for visible content. Provide:

- A unique useful title and description for each public route.
- Canonical URLs for `rahuly.in`.
- Open Graph and social preview metadata.
- Factual JSON-LD only.
- Person or ProfilePage structured data where valid.
- Article structured data for writings.
- Project or CreativeWork structured data only when visible factual content and page purpose support it; emit none while every project remains WIP.
- BreadcrumbList structured data where useful.
- `robots.txt`.
- A sitemap containing indexable canonical routes. Self-canonical WIP project details remain excluded while marked `noindex,follow`.
- RSS for published writings.
- Direct static-route refresh support, verified separately from deployment rewrites.
- Accessible not-found behavior.

Do not add unsupported claims to structured data. Keep draft and private content out of production metadata, RSS, sitemap, and route generation.

Milestone 9 uses the exact production origin `https://rahuly.in`; home retains its trailing slash and other known canonical paths do not. Query strings and fragments never enter canonical or social URLs. Open Graph uses locale `en_IN`, while HTML, structured data, and RSS use `en-IN`. Text-only Twitter `summary` cards contain no handles or image. Home emits `WebSite` and `ProfilePage` with a minimal factual `Person`; the writings index emits `CollectionPage` and its five-item `ItemList`; writing details emit factual `Article` and visible-path `BreadcrumbList` data. Unknown routes, the SPA fallback, and WIP project details receive no structured data.

The social-preview image, favicon, and web manifest are deferred. Google verification, Search Console, analytics, tags, advertising, consent tooling, deployment, and DNS remain outside this milestone and frontend-v1 repository scope.

## Performance Requirements

Plan, implement, and verify:

- Static output with no runtime frontend server.
- Route-level code splitting where supported.
- Limited client JavaScript.
- Build-time content processing rather than unnecessary runtime parsing.
- Optimized local images with explicit dimensions.
- Responsive image loading and modern formats where appropriate.
- Minimal font weights.
- Self-hosted or system fonts; do not use a font CDN.
- No remote image hotlinks.
- No avoidable layout shift.
- No excessive animation library.
- No visual effects that compromise reading performance.
- Production-build output inspection.

Prefer simple platform capabilities over dependencies when they satisfy the requirement accessibly and maintainably.

## Testing and Quality Strategy

### Test Layers

Use:

- Unit tests for Zod schemas, content helpers, date and URL rules, derived data, and repository behavior.
- Component tests for design-system primitives and interactions.
- Integration tests for content-driven sections and route data behavior.
- Playwright tests for public routes, direct refreshes, navigation, themes, menus, projects, writings, contact links, and approved résumé download behavior.
- axe checks for representative pages and important interactive states.
- Production-build verification for static artifacts and generated routes.

Include explicit tests for:

- Invalid public content.
- Duplicate IDs and duplicate slugs.
- Invalid URLs and dates.
- Draft exclusion.
- Missing and invalid routes.
- Content ordering.
- Safe Markdown rendering.
- Theme persistence and first-paint behavior.
- Keyboard-operable navigation and controls.
- Accessible empty, error, and not-found states.

### Canonical Commands

After the React migration establishes the npm project, provide:

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run test`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`

Make `npm run verify` the required non-browser quality aggregate. Run `npm run test:e2e` in addition for route, UI, navigation, content-rendering, and accessibility changes.

Until migration is complete, run only commands that actually exist in the legacy repository. Treat current Yarn scripts as temporary and do not claim that the no-op legacy test command provides coverage.

### Quality Policy

Do not weaken strict TypeScript, lint, formatting, tests, accessibility rules, or CI to make checks pass. Fix root causes. Record all commands and outcomes, including skipped checks and the reason.

Use GitHub Actions to run deterministic install, type, lint, format-check, unit/integration, build, and other approved quality checks. Add browser checks to CI when the milestone establishes a reliable Playwright environment. Keep deployment out of quality workflows.

## Milestones and Acceptance Criteria

Complete and merge each milestone before beginning the next dependent milestone. Use one short-lived branch and one focused task per milestone.

### 1. Repository Guidance and Frontend Plan

Deliver:

- Root `AGENTS.md` with concise durable repository rules.
- `docs/portfolio-v1-plan.md` as the product and architecture source of truth.

Accept when:

- Both documents reflect the approved product, architecture, privacy, design, quality, review, workflow, milestone, and exclusion decisions.
- No application, package, lock, deployment, backend, résumé, or profile-photo work is included.
- Only the two approved documentation files differ from `main`.

### 2. React Foundation and CI

Deliver:

- A root-level React Router Framework Mode application using Vite and strict TypeScript.
- Static pre-rendering foundations for known public routes.
- npm scripts and deterministic package management.
- Tailwind's supported Vite integration and only minimal semantic styling scaffolding.
- Baseline Vitest, Testing Library, Playwright, axe, and GitHub Actions integration appropriate to the foundation.

Accept when:

- Versions are latest stable, mutually compatible, and verified against official documentation.
- The legacy application is replaced only within the approved migration diff.
- The static build, canonical non-browser checks, representative browser smoke checks, and CI pass.
- The application has an intentionally minimal, clearly transitional visual shell and does not establish or imitate the final design.
- No résumé processing, final content, backend, deployment, or AWS work is included.

### 3. Validated Résumé and Content Architecture

Deliver:

- Private-source protection, including `references/private/` in `.gitignore` before source files enter the repository tree.
- Structured review of the two supplied résumé PDFs.
- Conflict and approval tracking without publishing private source files.
- Typed domain records, Zod schemas, cross-record validation, and the asynchronous `ContentRepository` contract.
- `StaticContentRepository` and validated local public content foundations.
- Content-validation tests, including duplicates, invalid data, ordering, and draft behavior.

Accept when:

- Rahul has resolved or explicitly deferred every source conflict.
- Public personal data, employment metrics, project claims, and résumé download are individually approved before publication.
- No private résumé source, confidential detail, or invented claim is committed.
- Components and routes obtain typed content through the repository rather than raw files.
- Invalid public content fails tests or the production build with actionable diagnostics.
- No final visual design, backend, or API implementation is introduced.

### 4. Design System and Theme Foundation

Deliver:

- Semantic color, typography, spacing, radius, border, shadow, motion, layout, and breakpoint tokens.
- Light, dark, and system theme behavior with persisted preference and correct first paint.
- Approved focus treatment and reduced-motion behavior.
- Local reusable primitives and representative previews.
- A distinct editorial-engineering direction created from scratch.

Accept when:

- Rahul reviews and approves the representative design-system preview before site-wide application.
- Token and primitive behavior is accessible, responsive, tested, and documented through a clean local public API.
- The system does not reuse or imitate legacy presentation.
- No separate shared package is created.
- Profile-photo processing has not occurred before design-system approval.

### 5. Site Shell, Hero, About and Contact

Deliver:

- Accessible responsive navigation, skip link, layout shell, and footer.
- Hero, professional positioning, introduction, primary calls to action, about, credibility highlights, contact, and approved social actions.
- Approved résumé download behavior and approved profile image only if supplied after the design gate.

Accept when:

- Content comes from `ContentRepository` and approved public records.
- Navigation, themes, menus, contact actions, and direct routes work by keyboard and across target viewports.
- There is no fake working contact form.
- Personal data and media have explicit approval.
- Component, integration, Playwright, axe, zoom, overflow, and visual checks pass.

### 6. Experience, Skills and Education

Deliver:

- Featured experience and professional experience timeline.
- Technical skill groups.
- Education.
- Web-readable summaries and progressive disclosure where useful.

Accept when:

- Titles, dates, technologies, metrics, and descriptions match approved validated sources.
- Duplicate employment and confidential employer or customer information are absent.
- Heading order, timeline semantics, responsive layouts, and keyboard reading order are accessible.
- Relevant unit, integration, browser, axe, and visual checks pass.

### 7. Projects and Case Studies

Deliver:

- Featured projects on the home page.
- `/projects` and pre-rendered project detail routes.
- Validated project schemas, slugs, status, problem, role, approach, architecture, decisions, stack, outcomes, links, SEO data, and related navigation.
- Tourney, URL Shortener, Portfolio Tracker, and Universal Job Tracker roadmap case studies based on approved public records.
- Intentional, design-system-aligned fallback visuals while the projects remain work in progress.

Accept when:

- Rahul approves every public project claim, planned destination, architecture statement, and roadmap item.
- No users, traffic, revenue, testimonial, metric, or result is invented.
- All public slugs pre-render and invalid slugs show the accessible not-found experience.
- Project routes, navigation, metadata, responsive behavior, tests, axe checks, and production build pass.

### 8. Writings

Status: complete and merged. This combined milestone includes both the former writings-engine and initial-article work; article creation is not pending Milestone 9 work.

Deliver:

- Local plain-Markdown ingestion behind `StaticContentRepository`, with one strict JSON-front-matter file per stable slug and no runtime Markdown parsing.
- Validated writing metadata, actionable file-and-field diagnostics, deterministic draft exclusion and ordering, derived reading time, stable headings, generated tables of contents, safe typed article nodes, language-labelled code blocks, accessible copy controls, and responsive tables.
- The five approved experience-derived articles, drafted without confidential details, unapproved metrics, invented production claims, or the rejected future-content-API topic.
- A pre-rendered editorial `/writings` index and one pre-rendered detail route per published writing slug, including accessible empty and invalid-slug states, related links, and deterministic newer/older navigation.
- Unique article metadata and canonical URLs, factual `Article` JSON-LD, summary-only RSS 2.0 at `/rss.xml`, and a sitemap at `/sitemap.xml` containing the validated public route inventory.
- Structural static-output verification, focused unit and browser coverage, and responsive, theme, accessibility, no-JavaScript, print, and visual evidence.

Accept when:

- All five approved public Markdown records validate and publish on consecutive Mondays from 2026-07-20 through 2026-08-17, retain deterministic reverse-chronological ordering, and use the approved date-above-title index layout without a wide date rail.
- No MDX, raw HTML, arbitrary scripts, unsafe links, embedded executable components, direct raw-Markdown imports, or unchecked storage-to-presentation assertions appear in components or routes.
- Draft and archived records are excluded at the repository boundary and cannot reach route generation, route data, metadata, JSON-LD, RSS, sitemap, static artifacts, or browser output.
- Index route data contains no article bodies, detail route data contains no raw Markdown or unrelated article bodies, and public projections exclude source paths, hashes, approval IDs, governance metadata, and storage-only fields.
- Published writing routes, direct refreshes, the accessible unknown-slug `noindex,follow` experience, copy controls, tables, headings, feeds, static artifacts, and existing routes have automated coverage.
- Focused type, lint, format, unit, build, static, Playwright, axe, keyboard, responsive, theme, forced-colors, reduced-motion, no-JavaScript, 200% text, overflow, and print checks pass before visual review.
- Rahul reviews and approves the complete editorial text and visual evidence before the full-suite approval gate, commit, push, or draft pull request.

### 9. SEO, Accessibility and Performance Hardening

Deliver:

- Final page titles, descriptions, canonical URLs, social metadata, robots directives, sitemap, RSS, and factual structured data.
- Full accessibility review and targeted remediation.
- Image, font, JavaScript, rendering, layout-shift, and static-output optimization.
- Production-build and direct-route inspection.
- A typed public SEO projection and shared canonical, metadata, structured-data, and safe JSON-LD serialization helpers.
- Text-only Open Graph and Twitter metadata, RSS discovery on indexable HTML routes, exact `robots.txt`, the eight-URL sitemap policy, and canonical exceptions for unknown output.
- `WebSite` and `ProfilePage` data on home, `CollectionPage` with `ItemList` on the writings index, and `Article` with `BreadcrumbList` on writing details; no project entity data while projects remain WIP.
- Preservation of the approved home, internal project-plan links, public content, route slugs, visual system, and 20-file public media inventory.

Accept when:

- Representative routes pass automated checks and manual keyboard, focus, contrast, reduced-motion, theme, 200% zoom, overflow, and responsive review.
- SEO output is consistent with validated visible content and excludes private or draft records.
- All known routes and slugs generate correctly, and invalid routes remain accessible.
- Production output contains no font CDN, remote image hotlinks, unnecessary runtime content parsing, or avoidable heavy animation code.
- Relevant unit, integration, Playwright, axe, build, and performance checks pass.
- The output inventory remains 12 HTML routes, 14 route-data files, two XML resources, one SPA fallback, one root `robots.txt`, and 20 public media assets; RSS has five items and the sitemap has eight URLs with article-only `lastmod` values.
- Unknown routes and the fallback use exact `noindex,follow` without canonical, social URL, feed discovery, or structured data; WIP project details remain self-canonical `noindex,follow` pages and stay out of the sitemap.
- Social imagery, favicon, manifest, analytics, Search Console, deployment, DNS, release, and Milestone 10 work are absent.

### 10. Final Frontend v1 Audit and Release Tag

Deliver:

- A full scope, architecture, content, privacy, design, accessibility, SEO, performance, testing, and exclusion audit.
- Final production build and static-route inventory.
- Resolved `/review` findings and GitHub checks.
- Rahul-reviewed visual evidence and public-content approval record.
- A frontend-v1 release tag only after the final branch is approved and squash-merged.

Accept when:

- Every preceding milestone is merged and post-merge verification succeeds.
- Canonical checks and complete browser coverage pass on the release candidate.
- No private source material, unsupported factual claim, excluded backend/deployment work, or legacy presentation remains.
- Rahul approves the final diff and visual result, performs the squash merge, and explicitly authorizes the release tag.

## Git, Review, and Delivery Workflow

Use one short-lived branch and one focused task per milestone. Follow this sequence for every development milestone:

1. Start from a clean working tree.
2. Switch to `main`.
3. Pull `origin/main` using `--ff-only`.
4. Create a milestone branch.
5. Read `AGENTS.md`.
6. Read this entire plan.
7. Inspect the current repository.
8. Propose a milestone-specific implementation plan.
9. Wait for approval.
10. Implement only the approved scope.
11. Run relevant local checks.
12. Preview visual behavior when applicable.
13. Run `/review` against `main`.
14. Fix actionable findings.
15. Rerun local checks.
16. Commit with a Conventional Commit-style message.
17. Push the branch.
18. Create a draft pull request.
19. Wait for GitHub checks.
20. Fix failed CI without weakening checks.
21. Present the diff, check results, and visual evidence for Rahul's review.
22. Let Rahul perform the squash merge; never merge automatically.
23. Delete the merged branch.
24. Pull the updated `main`.
25. Run post-merge verification before starting the next milestone.

Do not commit, push, open a pull request, tag, merge, or delete a branch before the applicable step is explicitly authorized. Do not combine dependent milestones or carry unrelated changes into a milestone branch.

## Deferred Backend and Deployment Considerations

Frontend v1 deliberately creates only the boundary needed for future content delivery. A later `ApiContentRepository` may retrieve the same domain records after a separate backend is designed, but this plan does not choose its transport, endpoints, persistence, schema, cache, authentication, authorization, administration, or hosting.

Defer all of the following until the static frontend is complete and tagged:

- Backend repository and API implementation.
- Database and schema design.
- Authentication, shared user-auth, and administration.
- CMS selection or integration.
- Contact-form infrastructure.
- Analytics, tracking, comments, and newsletter systems.
- Deployment provider and production topology.
- AWS, EC2, cloud resources, and AWS tooling.
- Domain, DNS, certificates, and `rahuly.in` cutover.
- Hosting rewrite and direct-route fallback rules.

Keep the static output portable. Do not encode speculative infrastructure assumptions into routes, components, content models, or build behavior. Revisit deployment and backend architecture only through separately approved post-v1 milestones.
