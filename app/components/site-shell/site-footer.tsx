import type { MouseEvent } from "react";
import { NavLink } from "react-router";
import { Container } from "@rahulyadev/design-system";

export function SiteFooter() {
  const backToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    const destination = document.getElementById("top");
    if (destination === null) return;

    event.preventDefault();
    destination.focus({ preventScroll: true });
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      left: 0,
      top: 0,
    });
  };

  return (
    <footer className="site-footer">
      <Container className="site-footer__inner" width="wide">
        <nav aria-label="Footer">
          <ul className="site-footer__navigation">
            <li>
              <NavLink end to="/">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects">Projects</NavLink>
            </li>
            <li>
              <NavLink to="/writings">Writings</NavLink>
            </li>
            <li>
              <a href="#top" onClick={backToTop}>
                Back to top
              </a>
            </li>
          </ul>
        </nav>
        <p className="site-footer__message">
          Made with{" "}
          <span aria-label="love" role="img">
            ❤️
          </span>{" "}
          in India · Thank you for visiting.
        </p>
      </Container>
    </footer>
  );
}
