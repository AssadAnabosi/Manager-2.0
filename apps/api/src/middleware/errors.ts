import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Hook } from "@hono/zod-openapi";
import {
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  ResponseError,
  capitalize,
  clientIp,
} from "../lib/http";
import type { AppEnv } from "../types";

const UNIQUE_RE = /UNIQUE constraint failed: (\w+)\.(\w+)(?:, (\w+)\.(\w+))*/;

const errorChain = (err: unknown): string => {
  const parts: string[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 4 && cur instanceof Error; i++) {
    parts.push(cur.message);
    cur = (cur as Error & { cause?: unknown }).cause;
  }
  return parts.join(" | ");
};

/** Maps a D1 unique-constraint failure to a 409 message, or undefined if it is not one. */
export const uniqueViolationMessage = (err: unknown): string | undefined => {
  const match = UNIQUE_RE.exec(errorChain(err));
  if (!match) return undefined;
  const [full, table, column] = match;
  const columns = full
    .slice("UNIQUE constraint failed: ".length)
    .split(", ")
    .map((s) => s.split(".")[1]);
  if (table === "users" && column === "username")
    return "Username is already taken";
  if (
    table === "logs" &&
    columns.includes("date") &&
    columns.includes("worker_id")
  )
    return "There is a record of this log already";
  return `${capitalize(column.replace(/_/g, " "))} already exists`;
};

export const errorBody = (message: string | string[]) => ({
  success: false as const,
  message,
});

export const onError: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ResponseError) {
    return c.json(errorBody(err.message), err.statusCode as 400);
  }
  if (err instanceof HTTPException) {
    return c.json(errorBody(err.message), err.status as 400);
  }
  const unique = uniqueViolationMessage(err);
  if (unique) return c.json(errorBody(unique), CONFLICT);

  // Never log the request body: it may contain passwords.
  console.error(
    `[error] ${c.req.method} ${new URL(c.req.url).pathname} ip=${clientIp(c)}`,
    err
  );
  return c.json(errorBody("Internal Server Error"), INTERNAL_SERVER_ERROR);
};

export const notFound: NotFoundHandler<AppEnv> = (c) =>
  c.json(
    errorBody(
      "Oops, you have reached an undefined route, please check your request and try again"
    ),
    NOT_FOUND
  );

/** `defaultHook` for OpenAPIHono: Zod validation failures become a 400 with the issue messages. */
export const validationHook: Hook<any, AppEnv, any, any> = (result, c: Context) => {
  if (!result.success) {
    return c.json(
      errorBody(result.error.issues.map((issue) => issue.message)),
      BAD_REQUEST
    );
  }
};
