import { env } from "cloudflare:workers";
import { createApp } from "../src/app";
import { getDb } from "../src/db";
import { users } from "../src/db/schema";
import type { Env } from "../src/env";
import { hashPassword } from "../src/services/password";
import type { Role } from "@workbench/shared";

export const baseEnv = (over: Partial<Env> = {}): Env =>
  ({
    ...(env as unknown as Env),
    // independent of a developer's local .dev.vars
    BENCH: undefined,
    API_DOCS: "true",
    ...over,
  }) as Env;

export const TEST_PASSWORD = "correct horse battery";

export const resetDb = async () => {
  for (const table of [
    "login_attempts",
    "sessions",
    "logs",
    "cheques",
    "payees",
    "bills",
    "users",
  ]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
};

export const createUser = async (
  over: Partial<{
    username: string;
    password: string;
    role: Role;
    active: boolean;
    loggable: boolean;
    firstName: string;
    lastName: string;
    email: string | null;
  }> = {}
) => {
  const e = baseEnv();
  const row = {
    firstName: over.firstName ?? "Test",
    lastName: over.lastName ?? "User",
    username: over.username ?? "tester",
    email: over.email === undefined ? null : over.email,
    passwordHash: await hashPassword(over.password ?? TEST_PASSWORD, e),
    role: over.role ?? ("User" as Role),
    active: over.active ?? true,
    loggable: over.loggable ?? true,
  };
  const [created] = await getDb(env.DB).insert(users).values(row).returning();
  return created;
};

export type Client = ReturnType<typeof client>;

/** A client bound to one API prefix. `envOver` overrides bindings for every call. */
export const client = (prefix = "", envOver: Partial<Env> = {}) => {
  const e = baseEnv({ API_PREFIX: prefix, ...envOver });
  const app = createApp(prefix);
  const request = (
    path: string,
    init: RequestInit & { token?: string; cookie?: string; ip?: string } = {}
  ) => {
    const headers = new Headers(init.headers);
    if (init.token) headers.set("authorization", `Bearer ${init.token}`);
    if (init.cookie) headers.set("cookie", init.cookie);
    if (init.ip) headers.set("cf-connecting-ip", init.ip);
    if (init.body && !headers.has("content-type"))
      headers.set("content-type", "application/json");
    return app.request(`http://localhost${prefix}${path}`, { ...init, headers }, e);
  };
  const json = (
    method: string,
    path: string,
    body?: unknown,
    init: { token?: string; cookie?: string; ip?: string } = {}
  ) =>
    request(path, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      ...init,
    });
  const login = async (
    username = "tester",
    password = TEST_PASSWORD,
    ip = "1.1.1.1"
  ) => {
    const res = await json("POST", "/auth", { username, password }, { ip });
    const body = (await res.json()) as any;
    const cookie = (res.headers.get("set-cookie") ?? "").split(";")[0];
    return { res, body, token: body?.data?.accessToken as string, cookie };
  };
  return { app, env: e, request, json, login };
};
