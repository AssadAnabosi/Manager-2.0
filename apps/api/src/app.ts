import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import pkg from "../package.json";
import { PAYLOAD_TOO_LARGE } from "./lib/http";
import { errorBody, notFound, onError } from "./middleware/errors";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";
import { createRouter } from "./routes/router";
import { getIterations, hashPassword } from "./services/password";
import type { AppEnv } from "./types";

export const BODY_LIMIT_BYTES = 16 * 1024;

const allowedOrigins = (raw: string | undefined): string[] =>
  (raw ?? "").split(/\s+/).filter(Boolean);

/**
 * Builds the app once per isolate. Hono's basePath is fixed at construction, so the
 * API (and its OpenAPI document) is built without a prefix and mounted under `prefix`.
 */
export const createApp = (prefix = "") => {
  const api = createRouter();

  api.route("/", healthRoutes());
  api.route("/", authRoutes(prefix));

  // OpenAPI + Swagger UI: public, but only served when API_DOCS="true" (never in production)
  api.use("/openapi.json", async (c, next) =>
    c.env.API_DOCS !== "true" ? notFound(c) : next()
  );
  api.use("/docs", async (c, next) =>
    c.env.API_DOCS !== "true" ? notFound(c) : next()
  );
  api.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });
  api.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "Workbench API", version: pkg.version },
    servers: [{ url: prefix || "/" }],
  });
  api.get("/docs", swaggerUI({ url: `${prefix}/openapi.json` }));

  // Temporary benchmark route used to tune PBKDF2_ITERATIONS; only when BENCH="true".
  api.get("/__bench/pbkdf2", async (c) => {
    if (c.env.BENCH !== "true") return notFound(c);
    const n = String(Number(c.req.query("n") ?? c.env.PBKDF2_ITERATIONS));
    getIterations({ PBKDF2_ITERATIONS: n });
    await hashPassword("benchmark-password", {
      ...c.env,
      PBKDF2_ITERATIONS: n,
    });
    return c.body(null, 204);
  });

  const app = new Hono<AppEnv>();
  app.use("*", (c, next) =>
    cors({
      origin: (origin) =>
        allowedOrigins(c.env.ALLOWED_ORIGINS).includes(origin) ? origin : null,
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    })(c, next)
  );
  app.use(
    "*",
    bodyLimit({
      maxSize: BODY_LIMIT_BYTES,
      onError: (c) =>
        c.json(errorBody("Request body is too large"), PAYLOAD_TOO_LARGE),
    })
  );
  app.route(prefix, api);
  app.onError(onError);
  app.notFound(notFound);
  return app;
};
