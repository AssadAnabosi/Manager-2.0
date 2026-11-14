import type { CSSProperties } from "react";

/** The sidebar persists its open state in this cookie (see ui/sidebar.tsx). */
export function readSidebarOpen(): boolean {
  try {
    return !/(?:^|;\s*)sidebar_state=false/.test(document.cookie);
  } catch {
    return true;
  }
}

/** Sizes from the dashboard-01 block, shared by the app shell and its skeleton. */
export const SHELL_STYLE = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as CSSProperties;
