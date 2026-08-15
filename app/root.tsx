import { lazy, Suspense, type ReactNode } from "react";
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";
import { SkipLink } from "./components/ui";
import { THEME_BOOTSTRAP_SCRIPT, ThemeProvider } from "./theme";
import "./app.css";

const DevelopmentDesignSystemPreviewGate = import.meta.env.DEV
  ? lazy(async () => {
      const { DesignSystemPreviewGate } =
        await import("./design-system-preview/preview-gate");

      return { default: DesignSystemPreviewGate };
    })
  : undefined;

export const meta: Route.MetaFunction = () => [
  { title: "Portfolio foundation" },
  { name: "robots", content: "noindex" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
          suppressHydrationWarning
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <main>
      <p role="status">Loading page.</p>
    </main>
  );
}

function FoundationShell() {
  return (
    <>
      <SkipLink />
      <header className="site-header">
        <nav aria-label="Primary">
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects">Projects</NavLink>
            </li>
            <li>
              <NavLink to="/writings">Writings</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className="foundation-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

function DevelopmentPreviewBoundary({ children }: { children: ReactNode }) {
  if (!DevelopmentDesignSystemPreviewGate) {
    return children;
  }

  return (
    <Suspense fallback={children}>
      <DevelopmentDesignSystemPreviewGate>
        {children}
      </DevelopmentDesignSystemPreviewGate>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DevelopmentPreviewBoundary>
        <FoundationShell />
      </DevelopmentPreviewBoundary>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main id="main-content">
      <h1>{notFound ? "Page not found" : "Unexpected error"}</h1>
      <p>
        {notFound
          ? "The requested page is not available."
          : "The page could not be displayed."}
      </p>
      <a href="/">Return home</a>
    </main>
  );
}
