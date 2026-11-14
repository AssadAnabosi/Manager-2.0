import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { runCleanup } from "../src/index";
import { client, createUser, resetDb } from "./helpers";

describe.each(["", "/api"])("app with prefix %j", (prefix) => {
  const api = client(prefix);

  beforeEach(resetDb);

  it("GET / returns the version and environment", async () => {
    const res = await api.request(prefix ? "" : "/");
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body).toMatchObject({
      success: true,
      message: "What are you doing here ?",
      data: { environment: "test" },
    });
    expect(body.data.version).toEqual(expect.any(String));
  });

  it("GET /health returns 200", async () => {
    expect((await api.request("/health")).status).toBe(200);
  });

  it("404s unknown routes with the error envelope", async () => {
    const res = await api.request("/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      success: false,
      code: "ROUTE_NOT_FOUND",
      message:
        "Oops, you have reached an undefined route, please check your request and try again",
    });
  });

  it("413s bodies over 16 KB", async () => {
    const res = await api.request("/auth", {
      method: "POST",
      body: JSON.stringify({ username: "a", password: "x".repeat(17 * 1024) }),
    });
    expect(res.status).toBe(413);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("400s on malformed JSON", async () => {
    const res = await api.request("/auth", { method: "POST", body: "{nope" });
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.code).toBe("REQUEST_INVALID");
  });

  it("accepts very long passwords (no maximum) within the body limit", async () => {
    await createUser({ password: "p".repeat(5000) });
    const { res } = await api.login("tester", "p".repeat(5000));
    expect(res.status).toBe(200);
  });

  describe("CORS", () => {
    it("allows the configured origin with credentials", async () => {
      const res = await api.request("/health", {
        headers: { origin: "https://dash.example.com" },
      });
      expect(res.headers.get("access-control-allow-origin")).toBe(
        "https://dash.example.com"
      );
      expect(res.headers.get("access-control-allow-credentials")).toBe("true");
    });

    it("sends no CORS headers for an unknown origin", async () => {
      const res = await api.request("/health", {
        headers: { origin: "https://evil.example.org" },
      });
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
    });

    it("answers preflight for the allowed origin", async () => {
      const res = await api.request("/auth", {
        method: "OPTIONS",
        headers: {
          origin: "https://dash.example.com",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type,authorization",
        },
      });
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-methods")).toContain("PATCH");
      expect(res.headers.get("access-control-allow-headers")).toContain("Authorization");
      expect(res.headers.get("access-control-max-age")).toBe("86400");
    });

    it("supports several space-separated origins", async () => {
      const multi = client(prefix, {
        ALLOWED_ORIGINS: "https://a.example.com https://b.example.com",
      });
      const res = await multi.request("/health", {
        headers: { origin: "https://b.example.com" },
      });
      expect(res.headers.get("access-control-allow-origin")).toBe(
        "https://b.example.com"
      );
    });
  });

  describe("OpenAPI and Swagger UI", () => {
    it("serves the document listing the auth routes when API_DOCS is true", async () => {
      const res = await api.request("/openapi.json");
      expect(res.status).toBe(200);
      const doc = (await res.json()) as any;
      expect(doc.openapi).toBe("3.1.0");
      expect(doc.info.title).toBe("Workbench API");
      expect(doc.servers[0].url).toBe(prefix || "/");
      expect(Object.keys(doc.paths)).toEqual(
        expect.arrayContaining(["/auth", "/auth/refresh", "/auth/logout", "/health"])
      );
      expect(doc.components.securitySchemes.bearerAuth).toMatchObject({
        type: "http",
        scheme: "bearer",
      });
      expect(doc.paths["/auth"].get.security).toEqual([{ bearerAuth: [] }]);
    });

    it("serves Swagger UI pointing at the prefixed document", async () => {
      const res = await api.request("/docs");
      expect(res.status).toBe(200);
      expect(await res.text()).toContain(`${prefix}/openapi.json`);
    });

    it.each([undefined, "false", "no"])(
      "is not served when API_DOCS is %s (production default)",
      async (value) => {
        const prod = client(prefix, { API_DOCS: value });
        expect((await prod.request("/openapi.json")).status).toBe(404);
        expect((await prod.request("/docs")).status).toBe(404);
      }
    );
  });

  describe("benchmark route", () => {
    it("is 404 unless BENCH is true", async () => {
      expect((await api.request("/__bench/pbkdf2?n=1000")).status).toBe(404);
    });

    it("runs one hash when BENCH is true and rejects n above 100000", async () => {
      const bench = client(prefix, { BENCH: "true" });
      expect((await bench.request("/__bench/pbkdf2?n=1000")).status).toBe(204);
      expect((await bench.request("/__bench/pbkdf2?n=100001")).status).toBe(500);
    });
  });

  describe("cron cleanup", () => {
    it("deletes expired sessions and login attempts older than a day", async () => {
      const u = await createUser();
      const now = Date.now();
      const ins = (id: string, expires: number) =>
        env.DB.prepare(
          "INSERT INTO sessions (id, user_id, refresh_token_hash, ip_address, expires_at, created_at, updated_at) VALUES (?, ?, ?, 'x', ?, ?, ?)"
        )
          .bind(id, u.id, `hash-${id}`, expires, now, now)
          .run();
      await ins("expired", now - 1000);
      await ins("valid", now + 100000);
      const attempt = (key: string, ws: number) =>
        env.DB.prepare(
          "INSERT INTO login_attempts (key, window_start, count) VALUES (?, ?, 1)"
        )
          .bind(key, ws)
          .run();
      await attempt("ip:old", now - 2 * 86400000);
      await attempt("ip:recent", now - 3600000);

      await runCleanup(client(prefix).env, now);

      const sessions = (await env.DB.prepare("SELECT id FROM sessions").all()).results;
      expect(sessions.map((s: any) => s.id)).toEqual(["valid"]);
      const attempts = (await env.DB.prepare("SELECT key FROM login_attempts").all()).results;
      expect(attempts.map((a: any) => a.key)).toEqual(["ip:recent"]);
    });
  });
});
