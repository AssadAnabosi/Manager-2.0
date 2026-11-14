import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { DateRange } from "react-day-picker";

import {
  dateToString,
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
} from "@/lib/utils";

/**
 * A single string query parameter. The fallback is only what the UI shows when
 * the parameter is absent; it is not written to the URL.
 */
export function useSearchParam(
  key: string,
  fallback = ""
): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) || fallback;
  const setValue = useCallback(
    (next: string) =>
      setSearchParams(
        (prev) => {
          prev.delete(key);
          if (next) prev.set(key, next);
          return prev;
        },
        { replace: true }
      ),
    [key, setSearchParams]
  );
  return [value, setValue];
}

export type DateRangeParams = { from: string | null; to: string | null };

/** The `from` / `to` range of a list page, defaulting to the current month. */
export function useDateRangeParams(): [
  DateRangeParams,
  (range: DateRange | undefined) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const range: DateRangeParams = {
    from: searchParams.get("from") || getFirstDayOfCurrentMonth(),
    to: searchParams.get("to") || getLastDayOfCurrentMonth(),
  };
  const setRange = useCallback(
    (next: DateRange | undefined) =>
      setSearchParams(
        (prev) => {
          prev.delete("from");
          prev.delete("to");
          if (next?.from) prev.set("from", dateToString(next.from));
          if (next?.to) prev.set("to", dateToString(next.to));
          return prev;
        },
        { replace: true }
      ),
    [setSearchParams]
  );
  return [range, setRange];
}

/** Whether any of these URL parameters is set, and a way to remove them all. */
export function useFilterState(keys: string[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = keys.some((key) => searchParams.get(key));
  const clear = useCallback(
    () =>
      setSearchParams(
        (prev) => {
          for (const key of keys) prev.delete(key);
          return prev;
        },
        { replace: true }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSearchParams, keys.join(",")]
  );
  return { active, clear };
}
