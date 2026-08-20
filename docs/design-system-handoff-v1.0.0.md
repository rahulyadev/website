# Design-system registry adoption handoff v1.0.0

Status: registry-backed source adoption; deployment excluded.

Package: `@rahulyadev/design-system`

Version: `1.0.0`

Registry tarball: `https://registry.npmjs.org/@rahulyadev/design-system/-/design-system-1.0.0.tgz`

Artifact SHA-256: `5d02cdc8c8f82f38822e249a0ef10f7162badfd0fa4c6123f4d2f70cfb6a92dd`

Artifact integrity: `sha512-724FMuiABqT6vYbaS3OEA9LbgrPmlX3jPVzJRLFPGTSHXsjxxw8MRbLXBgVRoC8+Uiuzb/PSGFmKqYNsroMXbw==`

Artifact shasum: `88942893ae7a8ad428c2089250f0cb5b455a8750`

Provenance: GitHub OIDC trusted publishing from repository `rahulyadev/design-system`, source commit `f1cadb5cf37860929519061d858eb917da3a34d0`, workflow `.github/workflows/release.yml`, and workflow run `32362845116`. The trusted publisher permits stage creation only; publication followed a separate staged-package approval.

Public root exports: `Badge`, `Button`, `Card`, `Container`, `IconButton`, `LinkButton`, `Section`, `SectionHeading`, `SkipLink`, `VisuallyHidden`; their public props and finite-option types; and `BADGE_VARIANTS`, `BUTTON_SIZES`, `BUTTON_VARIANTS`, `CARD_VARIANTS`, `CONTAINER_WIDTHS`, and `SECTION_SPACING`.

Public theme exports: `DEFAULT_THEME_STORAGE_KEY`, `SYSTEM_THEME_QUERY`, `THEME_PREFERENCES`, `applyThemeToRoot`, `getEffectiveTheme`, `parseThemePreference`, `persistThemePreference`, `readThemePreference`, `createThemeBootstrapScript`, `ThemeProvider`, `useTheme`, and `ThemeToggle`, with their public types.

Peer dependencies: `react: ^18.3.1 || ^19.0.0`; `react-dom: ^18.3.1 || ^19.0.0`.

CSS import order: Tailwind; `@rahulyadev/design-system/tokens.css`; `@rahulyadev/design-system/base.css`; `@rahulyadev/design-system/primitives.css`; then portfolio `site-shell`, `home`, `professional`, `projects`, and `writings` styles. JavaScript does not import package CSS.

Theme storage key: `rahuly-theme-preference`.

Bootstrap/provider contract: `app/theme-config.ts` generates the inline bootstrap with the portfolio storage key. `app/root.tsx` places that script before the first theme-consuming stylesheet and passes the same key to `ThemeProvider`. Content Security Policy remains application-owned.

Verified environments: Node `24.19.0`; npm `11.17.0`; React and React DOM `19.2.8` in the portfolio; clean registry consumers on React and React DOM `18.3.1` and `19.2.8`; Chromium `151.0.7922.34` in `mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e`, with UTC, `en-IN`, one worker, and zero retries.

Portfolio verification: 20 unit-test files and 182 unit tests passed; the production build and exact static inventory passed; 166 browser tests passed with zero skips, retries, or flaky results; production and high-severity audits found zero vulnerabilities; and the final lockfile signature audit verified all 305 packages, including 124 attestations.

Runtime equivalence: all 22 JavaScript and CSS runtime files in the installed registry package are byte-identical to the accepted Phase 2 development artifact. The deterministic runtime manifest SHA-256 is `81dfcf41d28f411d888cae37fb527c796e76d51b6c2ccda26b8b933214e23b9d`.

Migration steps: install exact registry version `1.0.0`; replace reusable component, theme, and CSS imports with declared package exports; preserve the consumer-owned storage key and bootstrap boundary; adapt integration tests; remove duplicate reusable source; verify the complete application; and require package runtime-byte equality with the accepted local-equivalence artifact.

Removed duplicate paths: `app/components/ui/`, `app/theme/`, `app/styles/tokens.css`, `app/styles/base.css`, and `app/styles/primitives.css`.

Application rollback commit: `0bfde1c170e2b27ec92d98504b6fa25d66543bed`.

Package rollback version: `1.0.0-rc.0`.

Manual review: the repository owner completed the accepted local migration review before registry adoption.

Known limitations: the package intentionally contains reusable primitives, domain-neutral theme utilities, and opt-in CSS only. Portfolio routes, content, SEO, application styles, storage configuration, CSP, and deployment remain application-owned. Historical screenshot and computed-style evidence is reused only because the stable registry runtime is byte-identical to the accepted local-equivalence artifact, the migration source remains unchanged apart from registry metadata and handoff wording, and the complete portfolio browser suite passes. No deployment, production equivalence check, Git tag, or GitHub Release is part of this adoption.
