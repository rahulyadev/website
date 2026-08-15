import { useSyncExternalStore, type ReactNode } from "react";

import { DesignSystemPreview } from "./design-system-preview";
import "../styles/design-system-preview.css";

export const DESIGN_SYSTEM_PREVIEW_QUERY = "preview=design-system";

export function isDesignSystemPreviewSearch(search: string) {
  return new URLSearchParams(search).get("preview") === "design-system";
}

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);

  return () => {
    window.removeEventListener("popstate", callback);
  };
}

function getBrowserSnapshot() {
  return isDesignSystemPreviewSearch(window.location.search);
}

function getServerSnapshot() {
  return false;
}

export function DesignSystemPreviewGate({ children }: { children: ReactNode }) {
  const showPreview = useSyncExternalStore(
    subscribeToLocation,
    getBrowserSnapshot,
    getServerSnapshot,
  );

  return showPreview ? <DesignSystemPreview /> : children;
}
