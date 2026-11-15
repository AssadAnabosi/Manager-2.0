import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { client, TEST_PASSWORD } from "./helpers";
import { as, body, resetDb } from "./resources.helpers";

const NEW_PASSWORD = "a brand new passphrase";
const newUser = (over: Record<string, unknown> = {}) => ({
  firstName: "alice",
  lastName: "smith",
  username: "Alice.S",
  password: "long enough password",
  ...over,
});

describe.each(["", "/api"])("users with prefix %j", (prefix) => {
  const api = client(prefix);
  beforeEach(resetDb);

  describe("POST /users", () => {
    it("creates a user: lowercases username and email, capitalizes names, hashes the password", async () => {
      const { token } = await as(api, "Moderator");
      const res = await api.json(
        "POST",
        "/users",
        newUser({ email: "Alice@Example.COM", phoneNumber: "123" }),
        { token }
      );
      expect(res.status).toBe(201);
      const row = (await env.DB.prepare(
        "SELECT * FROM users WHERE username = 'alice.s'"
      ).first()) as any;
      expect(row).toMatchObject({
        first_name: "Alice",
        last_name: "Smith",
        email: "alice@example.com",
        phone_number: "123",
        role: "User",
        active: 1,
        theme: "system",
        language: "ar",
      });
      expect(row.password_hash).toMatch(/^pbkdf2-sha256\$/);
      // the new user can log in
      expect((await api.login("alice.s", "long enough password")).res.status).toBe(200);
    });

    it.each([
      [{ password: "short" }, "Password must be at least 12 characters long"],
      [{ username: "bad name!" }, "Username can only contain letters, numbers, hyphens, underscores, and periods"],
      [{ email: "nope" }, "Please provide a valid email"],
      [{ firstName: undefined }, "Please provide firstName in your request's body"],
    ])("400s on invalid input %j", async (over, message) => {
      const { token } = await as(api, "Administrator");
      const res = await api.json("POST", "/users", newUser(over), { token });
      expect(res.status).toBe(400);
      expect((await body(res)).message).toContain(message);
    });

    it("has no maximum password length", async () => {
      const { token } = await as(api, "Administrator");
      const res = await api.json("POST", "/users", newUser({ password: "x".repeat(200) }), { token });
      expect(res.status).toBe(201);
    });

    it("409s on a duplicate username", async () => {
      const { token } = await as(api, "Administrator");
      await api.json("POST", "/users", newUser(), { token });
      const res = await api.json("POST", "/users", newUser({ username: "ALICE.s" }), { token });
      expect(res.status).toBe(409);
      expect((await body(res)).message).toBe("Username is already taken");
    });
  });

  describe("GET /users", () => {
    it("lists users with `active` and filters by search and active", async () => {
      const { token } = await as(api, "Spectator");
      const admin = await as(api, "Administrator");
      await api.json("PATCH", `/users/${(await as(api, "User", "bob")).user.id}/status`, { active: false }, { token: admin.token });

      const all = await body(await api.request("/users", { token }));
      expect(all.data.users).toHaveLength(3);
      expect(all.data.users[0]).toMatchObject({ active: expect.any(Boolean), fullName: expect.any(String) });
      expect(all.data.users[0].passwordHash).toBeUndefined();

      const inactive = await body(await api.request("/users?active=false", { token }));
      expect(inactive.data.users.map((u: any) => u.username)).toEqual(["bob"]);

      const search = await body(await api.request("/users?search=ADMIN", { token }));
      expect(search.data.users.map((u: any) => u.username)).toEqual(["administrator"]);
      expect(search.data.search).toBe("ADMIN");
    });

    it("lists `loggable` and filters by it", async () => {
      const { token } = await as(api, "Spectator");
      const admin = await as(api, "Administrator");
      const bob = await as(api, "User", "bob");
      expect(
        (await body(await api.request("/users", { token }))).data.users.every((u: any) => u.loggable === true)
      ).toBe(true);
      await api.json("PATCH", `/users/${bob.user.id}/loggable`, { loggable: false }, { token: admin.token });
      const off = await body(await api.request("/users?loggable=false", { token }));
      expect(off.data.users.map((u: any) => u.username)).toEqual(["bob"]);
      const on = await body(await api.request("/users?loggable=true", { token }));
      expect(on.data.users.map((u: any) => u.username)).not.toContain("bob");
    });

    it("treats % and _ in search literally", async () => {
      const { token } = await as(api, "Administrator");
      const res = await body(await api.request("/users?search=%25", { token }));
      expect(res.data.users).toHaveLength(0);
    });
  });

  describe("GET /users/:userID", () => {
    it("returns the user, 400 for a bad ID and 404 for a missing one", async () => {
      const { token, user } = await as(api, "Spectator");
      const ok = await body(await api.request(`/users/${user.id}`, { token }));
      expect(ok.data.user).toMatchObject({ id: user.id, active: true });
      const bad = await api.request("/users/not-a-uuid", { token });
      expect(bad.status).toBe(400);
      expect((await body(bad)).message).toBe("Please provide a valid UserID");
      const missing = await api.request("/users/11111111-1111-4111-8111-111111111111", { token });
      expect(missing.status).toBe(404);
      expect((await body(missing)).message).toBe(
        "User With ID [11111111-1111-4111-8111-111111111111] Is Not Found"
      );
    });
  });

  describe("admin operations", () => {
    it("PUT updates details but rejects password, role, active and loggable", async () => {
      const admin = await as(api, "Administrator");
      const target = (await as(api, "User", "carol")).user;
      const ok = await api.json(
        "PUT",
        `/users/${target.id}`,
        { firstName: "karen", username: "Karen", email: "K@x.io", phoneNumber: "" },
        { token: admin.token }
      );
      expect(ok.status).toBe(204);
      const row = (await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(target.id).first()) as any;
      expect(row).toMatchObject({ first_name: "Karen", username: "karen", email: "k@x.io", phone_number: null });

      for (const field of ["password", "role", "active", "loggable"]) {
        const res = await api.json("PUT", `/users/${target.id}`, { [field]: "x" }, { token: admin.token });
        expect(res.status).toBe(400);
        expect((await body(res)).message).toContain(`You are not authorized to update the ${field} field`);
      }
    });

    it("PUT 409s when the new username is taken", async () => {
      const admin = await as(api, "Administrator");
      const a = (await as(api, "User", "taken")).user;
      expect(a).toBeTruthy();
      const b = (await as(api, "User", "other")).user;
      const res = await api.json("PUT", `/users/${b.id}`, { username: "taken" }, { token: admin.token });
      expect(res.status).toBe(409);
    });

    it("DELETE removes the user with their logs and sessions, but not yourself", async () => {
      const admin = await as(api, "Administrator");
      const target = (await as(api, "User", "dave")).user;
      await env.DB.prepare(
        "INSERT INTO logs (id, worker_id, date, is_absent, otv, payment, created_at, updated_at) VALUES ('l1', ?, 1, 1, 0, 0, 1, 1)"
      ).bind(target.id).run();
      expect((await api.json("DELETE", `/users/${admin.user.id}`, undefined, { token: admin.token })).status).toBe(400);
      expect((await api.json("DELETE", `/users/${target.id}`, undefined, { token: admin.token })).status).toBe(204);
      const logs = (await env.DB.prepare("SELECT COUNT(*) c FROM logs").first()) as any;
      const sessions = (await env.DB.prepare("SELECT COUNT(*) c FROM sessions WHERE user_id = ?").bind(target.id).first()) as any;
      expect(logs.c).toBe(0);
      expect(sessions.c).toBe(0);
    });

    it("reset password changes it and revokes that user's sessions", async () => {
      const admin = await as(api, "Administrator");
      const target = await as(api, "User", "erin");
      const res = await api.json("PATCH", `/users/${target.user.id}/password`, { password: NEW_PASSWORD }, { token: admin.token });
      expect(res.status).toBe(204);
      expect((await api.request("/auth", { token: target.token })).status).toBe(401);
      expect((await api.login("erin", TEST_PASSWORD)).res.status).toBe(401);
      expect((await api.login("erin", NEW_PASSWORD)).res.status).toBe(200);
      expect((await api.request("/auth", { token: admin.token })).status).toBe(200);
    });

    it("reset password enforces the 12 character minimum", async () => {
      const admin = await as(api, "Administrator");
      const target = (await as(api, "User", "frank")).user;
      const res = await api.json("PATCH", `/users/${target.id}/password`, { password: "short" }, { token: admin.token });
      expect(res.status).toBe(400);
    });

    it("role change works, rejects invalid roles and your own account", async () => {
      const admin = await as(api, "Administrator");
      const target = (await as(api, "User", "gina")).user;
      expect((await api.json("PATCH", `/users/${target.id}/role`, { role: "Moderator" }, { token: admin.token })).status).toBe(204);
      const row = (await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(target.id).first()) as any;
      expect(row.role).toBe("Moderator");
      const bad = await api.json("PATCH", `/users/${target.id}/role`, { role: "God" }, { token: admin.token });
      expect(bad.status).toBe(400);
      expect((await body(bad)).message).toContain("Invalid User Role [User,Spectator,Moderator,Administrator]");
      const self = await api.json("PATCH", `/users/${admin.user.id}/role`, { role: "User" }, { token: admin.token });
      expect(self.status).toBe(400);
      expect((await body(self)).message).toBe("You are not authorized to change your role");
    });

    it("status change works, rejects non-booleans and your own account", async () => {
      const admin = await as(api, "Administrator");
      const target = (await as(api, "User", "hank")).user;
      expect((await api.json("PATCH", `/users/${target.id}/status`, { active: false }, { token: admin.token })).status).toBe(204);
      expect((await api.login("hank")).res.status).toBe(403);
      expect((await api.json("PATCH", `/users/${target.id}/status`, { active: true }, { token: admin.token })).status).toBe(204);
      expect((await api.login("hank")).res.status).toBe(200);
      const bad = await api.json("PATCH", `/users/${target.id}/status`, { active: "yes" }, { token: admin.token });
      expect(bad.status).toBe(400);
      expect((await body(bad)).message).toContain("Invalid active status");
      const self = await api.json("PATCH", `/users/${admin.user.id}/status`, { active: false }, { token: admin.token });
      expect(self.status).toBe(400);
    });
  });

  describe("POST /users/check-username", () => {
    it("reports availability case-insensitively", async () => {
      const { token } = await as(api, "Moderator", "taken");
      const taken = await body(await api.json("POST", "/users/check-username", { username: "TAKEN" }, { token }));
      expect(taken.data.isAvailable).toBe(false);
      const free = await body(await api.json("POST", "/users/check-username", { username: "free" }, { token }));
      expect(free.data.isAvailable).toBe(true);
    });
  });

  describe("own account", () => {
    it("PATCH /users/password changes the password, revokes sessions and clears the cookie", async () => {
      const { token } = await as(api, "User", "ivy");
      const login = await api.login("ivy");
      const res = await api.json(
        "PATCH",
        "/users/password",
        { current: TEST_PASSWORD, new: NEW_PASSWORD },
        { token: login.token, cookie: login.cookie }
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("set-cookie")).toMatch(/refreshToken=;/);
      expect((await api.request("/auth", { token })).status).toBe(401);
      expect((await api.login("ivy", NEW_PASSWORD)).res.status).toBe(200);
    });

    it("PATCH /users/password rejects a wrong current password and a short new one", async () => {
      const { token } = await as(api, "User", "jack");
      const wrong = await api.json("PATCH", "/users/password", { current: "wrong password!!", new: NEW_PASSWORD }, { token });
      expect(wrong.status).toBe(400);
      expect((await body(wrong)).message).toBe("Invalid current password");
      const short = await api.json("PATCH", "/users/password", { current: TEST_PASSWORD, new: "short" }, { token });
      expect(short.status).toBe(400);
    });

    it("PATCH /users/preferences updates theme and language and validates them", async () => {
      const { token } = await as(api, "User", "kim");
      const ok = await api.json("PATCH", "/users/preferences", { theme: "dark", language: "en" }, { token });
      expect(ok.status).toBe(200);
      expect((await body(ok)).data).toEqual({ theme: "dark", language: "en" });
      const me = await body(await api.request("/auth", { token }));
      expect(me.data.user).toMatchObject({ theme: "dark", language: "en" });
      const bad = await api.json("PATCH", "/users/preferences", { theme: "neon", language: "en" }, { token });
      expect(bad.status).toBe(400);
      expect((await body(bad)).message).toContain("Invalid theme [light,dark,system]");
      const bad2 = await api.json("PATCH", "/users/preferences", { theme: "dark", language: "fr" }, { token });
      expect((await body(bad2)).message).toContain("Invalid language [en,ar]");
    });
  });
});
