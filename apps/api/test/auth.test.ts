import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_PER_IP, MAX_PER_USERNAME } from "../src/services/rate-limit";
import { client, createUser, resetDb, TEST_PASSWORD } from "./helpers";

describe.each(["", "/api"])("auth routes with prefix %j", (prefix) => {
  const api = client(prefix);

  beforeEach(resetDb);

  describe("POST /auth (login)", () => {
    it("logs in, returns the user and sets a strict, scoped refresh cookie", async () => {
      await createUser({ firstName: "Sam", lastName: "Lee", email: null });
      const { res, body } = await api.login();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Welcome back, Sam Lee");
      expect(body.data.accessToken).toEqual(expect.any(String));
      expect(body.data.user).toMatchObject({
        username: "tester",
        fullName: "Sam Lee",
        role: "User",
      });
      expect(body.data.user.password).toBeUndefined();
      expect(body.data.user.passwordHash).toBeUndefined();
      expect(body.data.user.active).toBeUndefined();
      expect(body.data.user._id).toBeUndefined();

      const cookie = res.headers.get("set-cookie")!;
      expect(cookie).toContain("refreshToken=");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("Secure");
      expect(cookie).toMatch(/SameSite=Strict/i);
      expect(cookie).toContain(`Path=${prefix}/auth`);
      expect(cookie).not.toMatch(/Domain=/i);
      expect(cookie).toMatch(/Max-Age=2592000/i);
    });

    it("stores only a hash of the refresh token", async () => {
      await createUser();
      const { cookie } = await api.login();
      const token = cookie.split("=")[1];
      const rows = (
        await env.DB.prepare("SELECT refresh_token_hash FROM sessions").all()
      ).results as { refresh_token_hash: string }[];
      expect(rows).toHaveLength(1);
      expect(rows[0].refresh_token_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(rows[0].refresh_token_hash).not.toContain(token);
    });

    it("is case-insensitive on the username", async () => {
      await createUser({ username: "tester" });
      const { res } = await api.login("TeStEr");
      expect(res.status).toBe(200);
    });

    it("400s when the body is incomplete", async () => {
      const res = await api.json("POST", "/auth", { username: "x" });
      expect(res.status).toBe(400);
      const body = (await res.json()) as any;
      expect(body.success).toBe(false);
      expect(body.message).toContain("Please provide password in your request's body");
    });

    it("401s on a wrong password and on an unknown user with the same message", async () => {
      await createUser();
      const wrong = await api.login("tester", "not the password!!");
      const unknown = await api.login("ghost", "not the password!!");
      expect(wrong.res.status).toBe(401);
      expect(unknown.res.status).toBe(401);
      expect(wrong.body.message).toBe("Invalid Credentials");
      expect(unknown.body.message).toBe("Invalid Credentials");
    });

    it("runs exactly one password derivation for known and unknown users (timing guard)", async () => {
      await createUser();
      await api.login("ghost", "whatever password"); // warms the per-isolate dummy hash
      const spy = vi.spyOn(crypto.subtle, "deriveBits");
      await api.login("ghost", "whatever password");
      const unknownCalls = spy.mock.calls.length;
      spy.mockClear();
      await api.login("tester", "whatever password");
      const knownCalls = spy.mock.calls.length;
      spy.mockRestore();
      expect(unknownCalls).toBe(1);
      expect(knownCalls).toBe(1);
    });

    it("checks `active` only after the password matches", async () => {
      await createUser({ active: false });
      const right = await api.login("tester", TEST_PASSWORD);
      expect(right.res.status).toBe(403);
      expect(right.body.message).toBe("Your account has been deactivated");
      const wrong = await api.login("tester", "not the password!!");
      expect(wrong.res.status).toBe(401);
      expect(wrong.body.message).toBe("Invalid Credentials");
    });

    it("rate limits per username after 5 failures and resets on success elsewhere", async () => {
      await createUser();
      for (let i = 0; i < MAX_PER_USERNAME; i++) {
        const r = await api.login("tester", "bad password here", `9.9.9.${i}`);
        expect(r.res.status).toBe(401);
      }
      const blocked = await api.login("tester", TEST_PASSWORD, "9.9.9.200");
      expect(blocked.res.status).toBe(429);
      expect(blocked.body.message).toBe(
        "Too many requests from this IP, please try again in a while"
      );
    });

    it("clears the username counter on success", async () => {
      await createUser();
      for (let i = 0; i < MAX_PER_USERNAME - 1; i++) {
        await api.login("tester", "bad password here", `8.8.8.${i}`);
      }
      expect((await api.login("tester", TEST_PASSWORD, "8.8.8.100")).res.status).toBe(200);
      for (let i = 0; i < MAX_PER_USERNAME - 1; i++) {
        const r = await api.login("tester", "bad password here", `8.8.7.${i}`);
        expect(r.res.status).toBe(401);
      }
    });

    it("rate limits per IP after 20 failures across usernames", async () => {
      for (let i = 0; i < MAX_PER_IP; i++) {
        const r = await api.login(`ghost${i}`, "bad password here", "7.7.7.7");
        expect(r.res.status).toBe(401);
      }
      const blocked = await api.login("ghost-new", "bad password here", "7.7.7.7");
      expect(blocked.res.status).toBe(429);
      const otherIp = await api.login("ghost-new", "bad password here", "7.7.7.8");
      expect(otherIp.res.status).toBe(401);
    });

    it("re-hashes the stored password when the iteration count changes", async () => {
      await createUser();
      const before = (await env.DB.prepare("SELECT password_hash h FROM users").first()) as any;
      expect(before.h).toMatch(/^pbkdf2-sha256\$1\$1000\$/);
      const higher = client(prefix, { PBKDF2_ITERATIONS: "2000" });
      expect((await higher.login()).res.status).toBe(200);
      const after = (await env.DB.prepare("SELECT password_hash h FROM users").first()) as any;
      expect(after.h).toMatch(/^pbkdf2-sha256\$1\$2000\$/);
      expect((await higher.login()).res.status).toBe(200);
    });

    it("deletes the previous session when logging in with an old cookie", async () => {
      await createUser();
      const first = await api.login();
      const res = await api.json(
        "POST",
        "/auth",
        { username: "tester", password: TEST_PASSWORD },
        { cookie: first.cookie }
      );
      expect(res.status).toBe(200);
      const count = (await env.DB.prepare("SELECT COUNT(*) c FROM sessions").first()) as any;
      expect(count.c).toBe(1);
    });
  });

  describe("GET /auth (me)", () => {
    it("returns the current user", async () => {
      await createUser({ role: "Moderator" });
      const { token } = await api.login();
      const res = await api.request("/auth", { token });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.user).toMatchObject({ username: "tester", role: "Moderator" });
    });

    it("401s without a token", async () => {
      const res = await api.request("/auth");
      expect(res.status).toBe(401);
    });

    it("401s with a garbage token", async () => {
      const res = await api.request("/auth", { token: "not.a.jwt" });
      expect(res.status).toBe(401);
    });

    it("401s once the session is gone", async () => {
      await createUser();
      const { token } = await api.login();
      await env.DB.prepare("DELETE FROM sessions").run();
      const res = await api.request("/auth", { token });
      expect(res.status).toBe(401);
    });

    it("403s with a deactivated user", async () => {
      const u = await createUser();
      const { token } = await api.login();
      await env.DB.prepare("UPDATE users SET active = 0 WHERE id = ?").bind(u.id).run();
      const res = await api.request("/auth", { token });
      expect(res.status).toBe(403);
    });

    it("403s with an expired token", async () => {
      await createUser();
      const short = client(prefix, { JWT_ACCESS_EXPIRE: "1s" });
      const { token } = await short.login();
      await new Promise((r) => setTimeout(r, 2100));
      const res = await short.request("/auth", { token });
      expect(res.status).toBe(403);
      expect(((await res.json()) as any).message).toBe(
        "Token Expired, Please Refresh Token"
      );
    });
  });

  describe("POST /auth/refresh", () => {
    it("issues a new access token and the user", async () => {
      await createUser();
      const { cookie } = await api.login();
      const res = await api.json("POST", "/auth/refresh", undefined, { cookie });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.accessToken).toEqual(expect.any(String));
      expect(body.data.user.username).toBe("tester");
      const me = await api.request("/auth", { token: body.data.accessToken });
      expect(me.status).toBe(200);
    });

    it("400s without a cookie", async () => {
      const res = await api.json("POST", "/auth/refresh");
      expect(res.status).toBe(400);
    });

    it("401s with an invalid cookie", async () => {
      const res = await api.json("POST", "/auth/refresh", undefined, {
        cookie: "refreshToken=junk",
      });
      expect(res.status).toBe(401);
    });

    it("401s when the session was revoked", async () => {
      await createUser();
      const { cookie } = await api.login();
      await env.DB.prepare("DELETE FROM sessions").run();
      const res = await api.json("POST", "/auth/refresh", undefined, { cookie });
      expect(res.status).toBe(401);
      expect(((await res.json()) as any).message).toBe("Please Login Again");
    });

    it("404s when the user was deleted", async () => {
      const u = await createUser();
      const { cookie } = await api.login();
      await env.DB.prepare("PRAGMA foreign_keys = OFF").run();
      await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(u.id).run();
      const res = await api.json("POST", "/auth/refresh", undefined, { cookie });
      expect(res.status).toBe(404);
    });

    it("403s for a deactivated user", async () => {
      const u = await createUser();
      const { cookie } = await api.login();
      await env.DB.prepare("UPDATE users SET active = 0 WHERE id = ?").bind(u.id).run();
      const res = await api.json("POST", "/auth/refresh", undefined, { cookie });
      expect(res.status).toBe(403);
    });

    it("401s with an expired refresh token and deletes the session", async () => {
      await createUser();
      const short = client(prefix, { REFRESH_MAX_AGE: "1s" });
      const { cookie } = await short.login();
      await new Promise((r) => setTimeout(r, 2100));
      const res = await short.json("POST", "/auth/refresh", undefined, { cookie });
      expect(res.status).toBe(401);
      expect(((await res.json()) as any).message).toBe(
        "Token Expired, Please Login Again"
      );
      const count = (await env.DB.prepare("SELECT COUNT(*) c FROM sessions").first()) as any;
      expect(count.c).toBe(0);
    });

    it("issues unique refresh tokens for back-to-back logins", async () => {
      await createUser();
      const a = await api.login();
      const b = await api.login();
      expect(a.cookie).not.toBe(b.cookie);
    });
  });

  describe("DELETE /auth/logout", () => {
    it("revokes the session and clears the cookie", async () => {
      await createUser();
      const { cookie, token } = await api.login();
      const res = await api.json("DELETE", "/auth/logout", undefined, { cookie });
      expect(res.status).toBe(200);
      expect(res.headers.get("set-cookie")).toMatch(/refreshToken=;/);
      expect((await api.request("/auth", { token })).status).toBe(401);
    });

    it("400s without a cookie", async () => {
      const res = await api.json("DELETE", "/auth/logout");
      expect(res.status).toBe(400);
    });
  });
});
