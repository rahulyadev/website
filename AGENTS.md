# Repository Guidance

## Project Goal and Source of Truth

Build Rahul Yadav's complete personal portfolio for `rahuly.in` for recruiters, engineering leaders, hiring managers, collaborators, and developers evaluating senior backend and backend-leaning full-stack experience.

Read [docs/portfolio-v1-plan.md](docs/portfolio-v1-plan.md) in full before planning, reviewing, or implementing portfolio work. Treat it as the source of truth for frontend-v1 product scope, architecture, design direction, milestone order, and acceptance criteria. Work only within the current approved milestone and resolve conflicts with the plan before editing.

## Current Transition State

Treat the application under `website/` and its Vue, Quasar, Pinia, Yarn, routing, component, styling, and test conventions as temporary legacy state. Do not preserve those conventions as the target architecture. Remove or migrate the legacy application only in an explicitly approved migration milestone.

Until the React migration is merged, run only commands that actually exist in `website/package.json`. Treat `yarn lint`, the current no-op `yarn test`, and `yarn build` as temporary legacy commands. Do not run the repository-wide legacy format command unless the milestone explicitly requires it.

## Target Frontend and Architectural Boundaries

- Use React, React Router Framework Mode, Vite, strict TypeScript, static pre-rendering, Tailwind CSS through its supported Vite integration, semantic CSS custom properties, Zod, plain Markdown, Vitest, Testing Library, Playwright, axe, npm, and GitHub Actions.
- Produce static files with no runtime frontend application server. Pre-render every known public route and content slug.
- Keep content out of presentation components. Define typed domain records and validate public content with Zod at the content boundary.
- Access content through an asynchronous `ContentRepository`. Use `StaticContentRepository` for frontend v1 and preserve substitutability for a future `ApiContentRepository`.
- Do not import raw JSON or Markdown directly from React components or route modules.
- Fail the build for invalid public content, invalid URLs or dates, and duplicate IDs or slugs.
- Do not add Redux, Zustand, a server-state cache, MDX, a CMS SDK, a network API, a backend client, authentication, a restrictive component library, or a heavy animation library without a demonstrated need and explicit approval.
- Keep backend, API, database, authentication, admin, CMS, analytics, deployment, AWS, domain, and DNS work outside frontend v1.

## Content, Privacy, and Factual Accuracy

- Publish only verified facts. Never invent or exaggerate roles, dates, technologies, metrics, users, traffic, revenue, testimonials, architectures, or outcomes.
- Flag conflicting source claims for Rahul's decision; never resolve them silently.
- Treat résumé source files as private references. Before placing any source résumé in the repository tree, add `references/private/` to `.gitignore`. Never commit private source résumés.
- Process the two résumé PDFs only during the validated résumé and content milestone. Require explicit approval before publishing an email address, phone number, address, résumé download, project claim, or employment metric.
- Exclude confidential employer and customer information.
- Use the existing remote avatar only as legacy inventory, never as the new profile image. Accept a profile photograph only after design-system approval and explicit asset approval.
- Store approved public images locally, remove unnecessary metadata, provide appropriate alt text, declare responsive dimensions, prefer modern formats where practical, and never hotlink remote images.

## Design, Accessibility, and Responsive Requirements

- Create a completely new editorial-engineering visual system. Do not port, imitate, translate, or preserve the legacy layout, navigation, colors, typography, spacing, components, cards, CSS, animation, visual hierarchy, responsive behavior, or Quasar presentation.
- Keep the React foundation intentionally visually minimal until the dedicated design-system milestone is approved.
- Use only the approved design system across portfolio routes after its review gate.
- Support light, dark, and system themes, persist explicit preference, and prevent a visible incorrect-theme flash.
- Use semantic HTML, logical headings, landmarks, native controls, accessible names, visible focus, a skip link, sufficient contrast, meaningful image alternatives, reduced motion, and touch-friendly targets.
- Design mobile-first for mobile, tablet, laptop, and wide desktop. Preserve functionality at 200% zoom and prevent horizontal overflow.
- Treat automated axe results as a supplement to manual keyboard and visual review.

## Quality Commands

After the React migration establishes them, use these as the canonical npm commands:

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run test`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`

Make `npm run verify` cover required non-browser checks. Also run `npm run test:e2e` for route, navigation, UI, content-rendering, and accessibility changes. Until migration, do not assume these commands exist.

Do not weaken TypeScript, lint, tests, accessibility checks, or CI to obtain a passing result. Record commands run and any checks not run.

## Git and Pull Request Workflow

- Use one short-lived branch and one focused task per milestone.
- Start from a clean tree, update `main` from `origin/main` with `--ff-only`, create the milestone branch, read this file and the complete plan, inspect the repository, propose a milestone-specific plan, and wait for approval.
- Implement only approved scope. Keep unrelated changes out of the diff.
- Run relevant checks and visual review, run `/review` against `main`, fix actionable findings, and rerun affected checks.
- Commit only when explicitly authorized, using a Conventional Commit-style message. Push and open a draft pull request only when authorized.
- Wait for GitHub checks and fix failures without weakening quality gates.
- Present the diff, checks, and visual evidence to Rahul for review.
- Never merge a pull request automatically. Rahul performs the squash merge.
- Begin a dependent milestone only after the preceding milestone is merged and post-merge verification succeeds.

## Dependencies, Secrets, and Safety

- Use npm as the target package manager after migration. Do not mix package managers.
- Add or upgrade dependencies only when the approved milestone needs them. During migration, select the latest stable mutually compatible versions and verify choices against official documentation.
- Review manifest and lockfile changes deliberately. Do not install packages during documentation-only work.
- Never commit credentials, tokens, private keys, private source files, personal data awaiting approval, or populated local environment files.
- Keep public configuration separate from secrets and provide only sanitized examples.
- Do not configure deployment, cloud resources, DNS, external services, or destructive migrations without a dedicated approved milestone.

## Definition of Done

Complete a milestone only when:

- The diff matches its approved scope and acceptance criteria.
- Content is validated, factual, privacy-reviewed, and approved where required.
- Known public routes pre-render successfully and direct-route behavior is verified when applicable.
- Required type, lint, format-check, unit, integration, end-to-end, accessibility, and production-build checks pass as applicable.
- Responsive behavior, themes, focus, keyboard use, reduced motion, 200% zoom, and overflow are reviewed for visual work.
- `/review` findings are resolved or explicitly dispositioned without weakening safeguards.
- Documentation reflects durable architectural decisions, and no unrelated or generated changes remain.
- The branch is ready for Rahul's review; merging remains Rahul's action.

## Code Review Rules

Prioritize findings as follows:

- **P0:** Critical security or privacy exposure, destructive data loss, or a completely broken application.
- **P1:** Incorrect behavior, broken routes, data exposure, factual errors, major accessibility failures, build or test failures, and regressions.
- **P2:** Maintainability, performance, responsive behavior, incomplete tests, and lesser accessibility problems.
- **P3:** Optional polish with no material correctness or usability impact.

Include file and line evidence, explain the user or contributor impact, and recommend an actionable correction. Avoid comments already enforced mechanically by configured formatters or linters.
