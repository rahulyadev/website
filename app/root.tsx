import type { MouseEvent, ReactNode } from "react";
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
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "Portfolio foundation" },
  { name: "robots", content: "noindex" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
  const mainContent = document.getElementById("main-content");

  if (mainContent) {
    event.preventDefault();
    mainContent.focus();
  }
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={focusMainContent}>
        Skip to content
      </a>
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
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
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
