import { lazy, Suspense, type ReactNode } from "react";
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";
import { SiteShell } from "./components/site-shell/site-shell";
import { loadSiteShellData } from "./content/portfolio-route-data.server";
import { buildNotFoundMetadata } from "./seo/metadata";
import { THEME_BOOTSTRAP_SCRIPT, ThemeProvider } from "./theme";
import "./app.css";

const DevelopmentDesignSystemPreviewGate = import.meta.env.DEV
  ? lazy(async () => {
      const { DesignSystemPreviewGate } =
        await import("./design-system-preview/preview-gate");

      return { default: DesignSystemPreviewGate };
    })
  : undefined;

export const meta: Route.MetaFunction = () => buildNotFoundMetadata();

export async function loader() {
  return loadSiteShellData();
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
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

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ThemeProvider>
      <DevelopmentPreviewBoundary>
        <SiteShell data={loaderData} />
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
