import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Hook } from "@hono/zod-openapi";
import {
  ERROR_MESSAGES,
  validationCode,
  type ErrorCode,
  type ValidationIssue,
} from "@workbench/shared";
import {
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  PAYLOAD_TOO_LARGE,
  ResponseError,
  TOO_MANY_REQUESTS,
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

/** Maps a D1 unique-constraint failure to a 409 code and message, or undefined if it is not one. */
export const uniqueViolation = (
  err: unknown
): { code: ErrorCode; message: string } | undefined => {
  const match = UNIQUE_RE.exec(errorChain(err));
  if (!match) return undefined;
  const [full, table, column] = match;
  const columns = full
    .slice("UNIQUE constraint failed: ".length)
    .split(", ")
    .map((s) => s.split(".")[1]);
  const known = (code: ErrorCode) => ({ code, message: ERROR_MESSAGES[code] });
  if (table === "users" && column === "username") return known("USERNAME_TAKEN");
  if (
    table === "logs" &&
    columns.includes("date") &&
    columns.includes("worker_id")
  )
    return known("LOG_EXISTS");
  if (table === "cheques" && column === "serial") return known("CHEQUE_SERIAL_EXISTS");
  if (table === "payees" && column === "name") return known("PAYEE_NAME_EXISTS");
  return {
    code: "ALREADY_EXISTS",
    message: `${capitalize(column.replace(/_/g, " "))} already exists`,
  };
};

/** `{ success: false, code, message }`; `message` defaults to the English text for the code. */
export const errorBody = (
  code: ErrorCode,
  message: string | string[] = ERROR_MESSAGES[code],
  errors?: ValidationIssue[]
) => ({
  success: false as const,
  code,
  message,
  ...(errors ? { errors } : {}),
});

const codeForStatus = (status: number): ErrorCode => {
  if (status === PAYLOAD_TOO_LARGE) return "PAYLOAD_TOO_LARGE";
  if (status === TOO_MANY_REQUESTS) return "TOO_MANY_REQUESTS";
  return "REQUEST_INVALID";
};

export const onError: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ResponseError) {
    return c.json(errorBody(err.code, err.message), err.statusCode as 400);
  }
  if (err instanceof HTTPException) {
    return c.json(
      errorBody(codeForStatus(err.status), err.message),
      err.status as 400
    );
  }
  const unique = uniqueViolation(err);
  if (unique) return c.json(errorBody(unique.code, unique.message), CONFLICT);

  // Never log the request body: it may contain passwords.
  console.error(
    `[error] ${c.req.method} ${new URL(c.req.url).pathname} ip=${clientIp(c)}`,
    err
  );
  return c.json(errorBody("INTERNAL_ERROR"), INTERNAL_SERVER_ERROR);
};

export const notFound: NotFoundHandler<AppEnv> = (c) =>
  c.json(errorBody("ROUTE_NOT_FOUND"), NOT_FOUND);

/**
 * `defaultHook` for OpenAPIHono: Zod validation failures become a 400 with the English issue
 * messages (`message`) and a coded issue per failure (`errors`) for clients to translate.
 */
export const validationHook: Hook<any, AppEnv, any, any> = (result, c: Context) => {
  if (!result.success) {
    const issues = result.error.issues as {
      message: string;
      path: PropertyKey[];
    }[];
    return c.json(
      errorBody(
        "VALIDATION_FAILED",
        issues.map((issue) => issue.message),
        issues.map((issue) => ({
          code: validationCode(issue.message) ?? "invalid",
          path: issue.path.map(String).join("."),
        }))
      ),
      BAD_REQUEST
    );
  }
};
