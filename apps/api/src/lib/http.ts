import type { Context } from "hono";

export const OK = 200;
export const CREATED = 201;
export const NO_CONTENT = 204;
export const BAD_REQUEST = 400;
export const NOT_AUTHENTICATED = 401;
export const NOT_AUTHORIZED = 403;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const PAYLOAD_TOO_LARGE = 413;
export const TOO_MANY_REQUESTS = 429;
export const INTERNAL_SERVER_ERROR = 500;

export class ResponseError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

export const clientIp = (c: Context): string =>
  c.req.header("cf-connecting-ip") ?? "unknown";

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);
