# rahuly.in

This repository contains the root React foundation for the `rahuly.in` portfolio. The current interface is intentionally minimal while the content and visual system are developed in later approved milestones.

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

The application uses React Router Framework Mode, Vite, strict TypeScript, and Tailwind CSS through its Vite integration.

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

The production build is written to `build/client`. This foundation pre-renders only:

- `/`
- `/projects`
- `/writings`

Project and writing detail patterns currently resolve to the accessible not-found experience because no public content slugs are part of this milestone. Hosting and deployment configuration are intentionally excluded.

See [the portfolio v1 plan](docs/portfolio-v1-plan.md) for the approved architecture, milestone boundaries, and acceptance criteria.
