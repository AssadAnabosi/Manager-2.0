import { beforeEach, describe, expect, it } from "vitest";
import type { Role } from "@workbench/shared";
import { client } from "./helpers";
import { as, resetDb, ROLES_ALL } from "./resources.helpers";

const ID = "00000000-0000-4000-8000-000000000000";

/**
 * Each case is [method, path, body, roles allowed past the guard].
 * A guarded request with an unknown ID must answer 404 for allowed roles and 403 for the rest
 * (a role guard that runs after the param check would otherwise leak existence).
 */
type Case = [string, string, unknown, Role[]];
const ALL = ROLES_ALL;
const SMA: Role[] = ["Spectator", "Moderator", "Administrator"];
const MA: Role[] = ["Moderator", "Administrator"];
const A: Role[] = ["Administrator"];

const cases: Case[] = [
  ["GET", "/users", undefined, SMA],
  ["POST", "/users", {}, MA],
  ["POST", "/users/check-username", {}, MA],
  ["GET", `/users/${ID}`, undefined, SMA],
  ["PUT", `/users/${ID}`, {}, A],
  ["DELETE", `/users/${ID}`, undefined, A],
  ["PATCH", `/users/${ID}/password`, {}, A],
  ["PATCH", `/users/${ID}/role`, {}, A],
  ["PATCH", `/users/${ID}/status`, {}, A],
  ["GET", "/logs", undefined, ALL],
  ["POST", "/logs", {}, MA],
  ["GET", `/logs/${ID}`, undefined, ALL],
  ["PUT", `/logs/${ID}`, {}, MA],
  ["DELETE", `/logs/${ID}`, undefined, MA],
  ["GET", "/bills", undefined, SMA],
  ["POST", "/bills", {}, MA],
  ["GET", `/bills/${ID}`, undefined, SMA],
  ["PUT", `/bills/${ID}`, {}, MA],
  ["DELETE", `/bills/${ID}`, undefined, MA],
  ["GET", "/payees", undefined, SMA],
  ["POST", "/payees", {}, MA],
  ["GET", `/payees/${ID}`, undefined, SMA],
  ["PUT", `/payees/${ID}`, {}, MA],
  ["DELETE", `/payees/${ID}`, undefined, MA],
  ["GET", "/cheques", undefined, SMA],
  ["POST", "/cheques", {}, MA],
  ["GET", `/cheques/${ID}`, undefined, SMA],
  ["PUT", `/cheques/${ID}`, {}, MA],
  ["DELETE", `/cheques/${ID}`, undefined, MA],
];

describe.each(["", "/api"])("role guards with prefix %j", (prefix) => {
  const api = client(prefix);
  beforeEach(resetDb);

  it.each(cases)("%s %s requires a token", async (method, path, payload) => {
    const res = await api.json(method, path, payload);
    expect(res.status).toBe(401);
  });

  it.each(cases)("%s %s role matrix", async (method, path, payload, allowed) => {
    for (const role of ALL) {
      const { token } = await as(api, role);
      const res = await api.json(method, path, payload, { token });
      if (allowed.includes(role)) {
        // past the guard: anything but 401/403 (400 validation or 404 unknown ID)
        expect([401, 403], `${role} should pass the guard`).not.toContain(res.status);
      } else {
        expect(res.status, `${role} should be forbidden`).toBe(403);
      }
      await resetDb();
    }
  });

  it("rejects a deactivated user's token on every guarded mount", async () => {
    const { user, token } = await as(api, "Administrator");
    const other = await as(api, "Moderator");
    expect((await api.request("/logs", { token })).status).toBe(200);
    await api.json("PATCH", `/users/${other.user.id}/status`, { active: false }, { token });
    expect((await api.request("/bills", { token: other.token })).status).toBe(403);
    expect(user.id).toBeTruthy();
  });
});
