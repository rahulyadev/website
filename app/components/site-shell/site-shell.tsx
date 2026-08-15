import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Outlet, useLocation } from "react-router";

import type { SiteShellData } from "../../domain/route-data";
import { Container, SkipLink, VisuallyHidden } from "../ui";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

interface SiteShellContextValue {
  setHomeHeroVisible: (visible: boolean) => void;
}

const SiteShellContext = createContext<SiteShellContextValue | undefined>(
  undefined,
);

export function useSiteShell() {
  const context = useContext(SiteShellContext);
  if (context === undefined) {
    throw new Error("useSiteShell must be used within SiteShell.");
  }
  return context;
}

interface SiteShellFrameProps {
  data: SiteShellData;
  homeRoute: boolean;
}

function SiteShellFrame({ data, homeRoute }: SiteShellFrameProps) {
  const [homeHeroVisible, setHomeHeroVisibleState] = useState(homeRoute);

  const setHomeHeroVisible = useCallback((visible: boolean) => {
    setHomeHeroVisibleState(visible);
  }, []);
  const context = useMemo(() => ({ setHomeHeroVisible }), [setHomeHeroVisible]);

  return (
    <SiteShellContext.Provider value={context}>
      <SkipLink />
      <SiteHeader
        compactIdentityVisible={!homeRoute || !homeHeroVisible}
        identity={data.identity}
        portrait={data.compactPortrait}
      />
      <main className="site-main" id="main-content" tabIndex={-1}>
        <div className="site-top-anchor" id="top" tabIndex={-1}>
          <VisuallyHidden>Top of page</VisuallyHidden>
        </div>
        <Container className="site-main__inner" width="wide">
          <Outlet />
        </Container>
      </main>
      <SiteFooter identity={data.identity} />
    </SiteShellContext.Provider>
  );
}

export function SiteShell({ data }: { data: SiteShellData }) {
  const location = useLocation();

  return (
    <SiteShellFrame
      data={data}
      homeRoute={location.pathname === "/"}
      key={location.pathname}
    />
  );
}
