/** The sidebar persists its open state in this cookie (see ui/sidebar.tsx). */
export function readSidebarOpen(): boolean {
  try {
    return !/(?:^|;\s*)sidebar_state=false/.test(document.cookie);
  } catch {
    return true;
  }
}
