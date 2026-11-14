import { useSyncExternalStore } from "react";

/** One breakpoint for overlays (and, later, the navigation). */
export const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches;
const getServerSnapshot = () => true;

/** Correct on the first render, unlike an effect-based media query hook. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
