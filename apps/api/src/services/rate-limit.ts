import { and, eq, inArray, lt, sql } from "drizzle-orm";
import type { DB } from "../db";
import { loginAttempts } from "../db/schema";

export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_PER_IP = 20;
export const MAX_PER_USERNAME = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const windowStart = (now: number) => Math.floor(now / WINDOW_MS) * WINDOW_MS;
const ipKey = (ip: string) => `ip:${ip}`;
const userKey = (username: string) => `user:${username}`;

/** True when this IP or username already used its failed-login budget in the current window. */
export const isLoginBlocked = async (
  db: DB,
  ip: string,
  username: string,
  now = Date.now()
): Promise<boolean> => {
  const rows = await db
    .select()
    .from(loginAttempts)
    .where(
      and(
        inArray(loginAttempts.key, [ipKey(ip), userKey(username)]),
        eq(loginAttempts.windowStart, windowStart(now))
      )
    );
  const ipCount = rows.find((r) => r.key === ipKey(ip))?.count ?? 0;
  const userCount = rows.find((r) => r.key === userKey(username))?.count ?? 0;
  return ipCount >= MAX_PER_IP || userCount >= MAX_PER_USERNAME;
};

export const recordFailedLogin = async (
  db: DB,
  ip: string,
  username: string,
  now = Date.now()
) => {
  const ws = windowStart(now);
  for (const key of [ipKey(ip), userKey(username)]) {
    await db
      .insert(loginAttempts)
      .values({ key, windowStart: ws, count: 1 })
      .onConflictDoUpdate({
        target: [loginAttempts.key, loginAttempts.windowStart],
        set: { count: sql`${loginAttempts.count} + 1` },
      });
  }
};

export const clearUserAttempts = async (db: DB, username: string) => {
  await db
    .delete(loginAttempts)
    .where(eq(loginAttempts.key, userKey(username)));
};

export const deleteOldAttempts = async (db: DB, now = Date.now()) => {
  await db
    .delete(loginAttempts)
    .where(lt(loginAttempts.windowStart, now - DAY_MS));
};
