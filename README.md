# rahuly.in

This repository contains the audited static React frontend v1 for the `rahuly.in` portfolio. The Milestone 10 release-readiness audit completed on 2026-08-18. The site presents Rahul Yadav's public professional profile, four internal WIP project plans, five published engineering articles, and their search-discovery resources without requiring a runtime frontend server.

## Requirements

- Node.js `24.19.0`
- npm `11.17.0`, bundled with the selected Node.js release

Use the version declared in `.nvmrc`, then install the locked dependency tree:

```sh
nvm use
npm ci
```

## Browser testing

Browser installation is normally needed once after a fresh checkout or a Playwright version change. Install Chromium and its required host packages before running the browser suite:

```bash
npx --no-install playwright install --with-deps chromium
npm run test:e2e
```

The `--with-deps` option can request normal host permission to install required system packages. Run the command in your normal host terminal if a restricted development environment cannot install those dependencies.

## Development

```sh
npm run dev
```

The application uses React Router Framework Mode, Vite, strict TypeScript, and Tailwind CSS through its Vite integration. Public content is validated with Zod at a server/build-only boundary and accessed through an asynchronous `ContentRepository`; presentation code does not import raw local content.

This migration branch consumes the exact public npm release `@rahulyadev/design-system@1.0.0`. The lockfile pins the verified registry tarball and integrity, and the published provenance identifies the package repository's `release.yml` workflow. Source adoption does not indicate that the portfolio has been deployed.

## Quality commands

| Command                 | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `npm run typecheck`     | Generate route types and run strict TypeScript checks |
| `npm run lint`          | Run ESLint                                            |
| `npm run format`        | Format supported files with Prettier                  |
| `npm run format:check`  | Check formatting without changing files               |
| `npm run test`          | Run the Vitest and Testing Library suite              |
| `npm run build`         | Create the production static build                    |
| `npm run verify:static` | Validate generated static artifacts                   |
| `npm run verify`        | Run all required non-browser checks                   |
| `npm run test:e2e`      | Build and run Playwright and axe checks in Chromium   |

## Static output

The production build is written to `build/client`. Its expected inventory is:

- 12 pre-rendered HTML routes: `/`, `/projects`, four `/projects/:slug` routes, `/writings`, and five `/writings/:slug` routes.
- 14 React Router route-data files.
- Two XML resources: `/rss.xml` and `/sitemap.xml`.
- One SPA fallback for direct navigation on a static host.
- One root `/robots.txt` text resource.
- Exactly 20 public media assets.

All four project records and internal detail routes are intentionally marked WIP. Project cards retain their internal “View project plan” links, while planned external application destinations remain non-interactive. WIP details are self-canonical, use `noindex,follow`, and are excluded from the eight-URL sitemap. Unknown routes are canonical exceptions: they render the accessible not-found view with `noindex,follow` and no canonical, social URL, feed discovery, or structured data.

The five published articles appear in deterministic reverse chronology and in both the summary-only RSS feed and the sitemap. Recent writings on the home page are deferred; the home page is unchanged. A social-preview image, favicon, and web manifest are also deferred, so Open Graph and Twitter output remains factual and text-only.

Private résumé sources, extracted text, and their comparison report remain ignored and untracked. Only typed public projections may enter route data or browser output. The annotated `v1.0.0` tag is reserved for the audited source after its release branch passes CI, final review, and squash merge; it does not represent a deployment or GitHub Release. Hosting, deployment, AWS, DNS, analytics, Search Console, and other external integrations remain excluded.

See [the design-system guide](docs/design-system.md) for the visual foundation and package integration. See [the portfolio v1 plan](docs/portfolio-v1-plan.md) for the architecture, milestone boundaries, and acceptance criteria.
