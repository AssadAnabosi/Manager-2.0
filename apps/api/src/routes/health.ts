import { createRoute, z } from "@hono/zod-openapi";
import pkg from "../../package.json";
import { OK } from "../lib/http";
import { createRouter, jsonResponse } from "./router";

const rootSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({ version: z.string(), environment: z.string() }),
});

export const healthRoutes = () => {
  const root = createRoute({
    method: "get",
    path: "/",
    tags: ["Meta"],
    summary: "Version and environment",
    responses: { 200: jsonResponse("Service info", rootSchema) },
  });

  const health = createRoute({
    method: "get",
    path: "/health",
    tags: ["Meta"],
    summary: "Health check",
    responses: {
      200: {
        description: "Healthy",
        content: { "text/plain": { schema: z.string() } },
      },
    },
  });

  return createRouter()
    .openapi(root, (c) =>
      c.json(
        {
          success: true as const,
          message: "What are you doing here ?",
          data: { version: pkg.version, environment: c.env.ENVIRONMENT },
        },
        OK
      )
    )
    .openapi(health, (c) => c.text("OK", OK));
};
