import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** The list pages whose search, filters and date range are remembered between visits. */
const LIST_PATHS = ["/worksheets", "/bills", "/cheques", "/payees", "/users"];

/** Parameters that open a form instead of filtering; never remembered. */
const TRANSIENT_PARAMS = ["add", "addSerial", "addAmount", "addType"];

const STORAGE_KEY = "workbench:list-filters";

const remembered = new Map<string, string>();

try {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored)
    for (const [path, search] of Object.entries(JSON.parse(stored)))
      if (typeof search === "string") remembered.set(path, search);
} catch {
  // no session storage: remembering still works until the page is reloaded
}

const persist = () => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(remembered))
    );
  } catch {
    // ignore
  }
};

/** Forget every remembered filter, e.g. when someone logs out. */
export function clearRememberedFilters() {
  remembered.clear();
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const filtersOf = (search: string) => {
  const params = new URLSearchParams(search);
  for (const key of TRANSIENT_PARAMS) params.delete(key);
  return params;
};

/**
 * Remembers each list page's filters. Coming back to a list page without any (through the
 * sidebar, the command menu, a shortcut) puts the last ones back, and flags the navigation
 * with `state.filtersRestored` so the page can say so. Changing a filter, clearing them or
 * leaving the page drops that flag.
 */
export function useRememberedFilters() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const previousPath = useRef<string | null>(null);

  useLayoutEffect(() => {
    const arrived = previousPath.current !== pathname;
    previousPath.current = pathname;
    if (!LIST_PATHS.includes(pathname)) return;

    const current = filtersOf(search);
    const saved = remembered.get(pathname);
    if (arrived && saved && !current.toString()) {
      // keep the form-opening parameters (?add=1...) of the link that brought us here
      const next = new URLSearchParams(saved);
      for (const [key, value] of new URLSearchParams(search))
        if (TRANSIENT_PARAMS.includes(key)) next.set(key, value);
      navigate(
        { pathname, search: `?${next.toString()}` },
        { replace: true, state: { filtersRestored: true } }
      );
      return;
    }
    remembered.set(pathname, current.toString());
    persist();
  }, [pathname, search, navigate]);
}
