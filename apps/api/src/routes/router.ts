import { OpenAPIHono, z } from "@hono/zod-openapi";
import { errorSchema } from "@workbench/shared";
import { validationHook } from "../middleware/errors";
import type { AppEnv } from "../types";

export const createRouter = () =>
  new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

export const bearer = [{ bearerAuth: [] }];

export const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: errorSchema } },
});

export const jsonResponse = <T extends z.ZodType>(
  description: string,
  schema: T
) => ({
  description,
  content: { "application/json": { schema } },
});

/** Error responses every protected route can return. */
export const protectedErrors = {
  401: errorResponse("Not authenticated"),
  403: errorResponse("Not authorized"),
};
