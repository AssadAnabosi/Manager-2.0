import type { CSSProperties } from "react";

/** The sidebar persists its open state in this cookie (see ui/sidebar.tsx). */
export function readSidebarOpen(): boolean {
  try {
    const saved = /(?:^|;\s*)sidebar_state=(true|false)/.exec(document.cookie);
    if (saved) return saved[1] === "true";
    // never chosen: open on a computer, closed on a tablet
    return window.matchMedia("(min-width: 1024px)").matches;
  } catch {
    return true;
  }
}

/** Sizes from the dashboard-01 block, shared by the app shell and its skeleton. */
export const SHELL_STYLE = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as CSSProperties;
