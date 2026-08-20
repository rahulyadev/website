import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { Container, IconButton } from "@rahulyadev/design-system";
import { ThemeToggle } from "@rahulyadev/design-system/theme";

import type { ResponsiveImageData } from "../../domain/route-data";
import { ResponsivePicture } from "../responsive-picture";

interface SiteHeaderProps {
  compactIdentityVisible: boolean;
  identity: {
    readonly displayName: string;
    readonly roleLabel: string;
  };
  portrait: ResponsiveImageData;
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SiteHeader({
  compactIdentityVisible,
  identity,
  portrait,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Node) ||
        navigationRegionRef.current?.contains(target)
      ) {
        return;
      }

      setMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <Container className="site-header__inner" width="wide">
        <NavLink
          aria-hidden={compactIdentityVisible ? undefined : true}
          className="compact-identity"
          data-visible={compactIdentityVisible}
          tabIndex={compactIdentityVisible ? undefined : -1}
          to="/"
        >
          <span className="compact-identity__portrait">
            <ResponsivePicture
              image={portrait}
              imageClassName="compact-identity__image"
              loading="eager"
              sizes="48px"
            />
          </span>
          <span className="compact-identity__copy">
            <span className="compact-identity__name">
              {identity.displayName}
            </span>
            <span className="compact-identity__role">{identity.roleLabel}</span>
          </span>
        </NavLink>

        <div className="site-navigation-region" ref={navigationRegionRef}>
          <IconButton
            aria-controls="primary-navigation-panel"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="site-menu-toggle"
            onClick={() => {
              setMenuOpen((open) => !open);
            }}
            ref={menuButtonRef}
            variant="ghost"
          >
            <MenuIcon open={menuOpen} />
          </IconButton>

          <div
            className="site-navigation-panel"
            data-open={menuOpen}
            id="primary-navigation-panel"
          >
            <nav aria-label="Primary">
              <ul className="site-navigation">
                <li>
                  <NavLink
                    className="site-navigation__link"
                    end
                    onClick={closeMenu}
                    to="/"
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="site-navigation__link"
                    onClick={closeMenu}
                    to="/projects"
                  >
                    Projects
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="site-navigation__link"
                    onClick={closeMenu}
                    to="/writings"
                  >
                    Writings
                  </NavLink>
                </li>
              </ul>
            </nav>
            <ThemeToggle aria-label="Site theme" presentation="compact" />
          </div>
        </div>
      </Container>
    </header>
  );
}
