import type { MiddlewareHandler } from "hono";
import { eq } from "drizzle-orm";
import type { SQLiteTable, AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { getDb } from "../db";
import { BAD_REQUEST, NOT_FOUND, ResponseError, capitalize } from "../lib/http";
import { isUuid } from "../lib/ids";
import type { AppEnv } from "../types";

/**
 * Validates an `:xxxID` path param (UUID, 400 otherwise), loads the row (404 otherwise)
 * and stores it as `record`. Mirrors the old `validateParamID`.
 */
export const paramRecord = (
  param: string,
  table: SQLiteTable & { id: AnySQLiteColumn }
): MiddlewareHandler<AppEnv> => {
  const model = capitalize(param.slice(0, param.length - 2));
  return async (c, next) => {
    const id = c.req.param(param);
    if (!isUuid(id)) {
      throw new ResponseError(
        "INVALID_ID",
        BAD_REQUEST,
        `Please provide a valid ${capitalize(param)}`
      );
    }
    const [row] = await getDb(c.env.DB)
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    if (!row) {
      throw new ResponseError(
        "RECORD_NOT_FOUND",
        NOT_FOUND,
        `${model} With ID [${id}] Is Not Found`
      );
    }
    c.set("record", row);
    await next();
  };
};
