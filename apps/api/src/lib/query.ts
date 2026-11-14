import { sql, type SQL } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import {
  endOfUtcDay,
  firstDayOfCurrentMonth,
  lastDayOfCurrentMonth,
  startOfUtcDay,
  toDayString,
} from "./dates";
import { BAD_REQUEST, ResponseError } from "./http";
import { isUuid } from "./ids";

export type RawListQuery = {
  from?: string;
  to?: string;
  search?: string;
  filter?: string;
  serial?: string;
};

const parseDay = (value: string, name: string): Date => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new ResponseError(`Please provide a valid ${name} date`, BAD_REQUEST);
  }
  return d;
};

/** Same behaviour as the old `reqQuery.helper`. */
export const parseListQuery = (query: RawListQuery, now = new Date()) => {
  const search = (query.search ?? "").trim();
  const filter = query.filter ? query.filter.split(",") : undefined;
  if (filter && !filter.every(isUuid)) {
    throw new ResponseError("Please provide a valid filter", BAD_REQUEST);
  }

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  if (!query.from && !query.to) {
    startDate = firstDayOfCurrentMonth(now);
    endDate = endOfUtcDay(lastDayOfCurrentMonth(now));
  }
  if (query.from) startDate = startOfUtcDay(parseDay(query.from, "from"));
  if (query.to) endDate = endOfUtcDay(parseDay(query.to, "to"));

  return {
    startDate,
    endDate,
    search,
    filter,
    serial: query.serial ? query.serial.trim() : null,
    from: startDate ? toDayString(startDate) : "",
    to: endDate ? toDayString(endDate) : "",
  };
};

/** Case-insensitive "contains" match with LIKE wildcards escaped. */
export const containsLike = (column: AnySQLiteColumn, term: string): SQL => {
  const escaped = term.replace(/[\\%_]/g, (m) => `\\${m}`);
  return sql`${column} LIKE ${`%${escaped}%`} ESCAPE '\\'`;
};

/** Empty strings mean "no value" and are stored as NULL. */
export const nullIfEmpty = (v: string | null | undefined): string | null =>
  v === undefined || v === null || v === "" ? null : v;
