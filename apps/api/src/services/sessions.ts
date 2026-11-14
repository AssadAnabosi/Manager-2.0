import { and, eq, lt } from "drizzle-orm";
import type { DB } from "../db";
import { sessions } from "../db/schema";

export const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const createSession = async (
  db: DB,
  input: {
    userId: string;
    refreshToken: string;
    ipAddress: string;
    expiresAt: Date;
  }
) => {
  const [row] = await db
    .insert(sessions)
    .values({
      userId: input.userId,
      refreshTokenHash: await sha256Hex(input.refreshToken),
      ipAddress: input.ipAddress,
      expiresAt: input.expiresAt,
    })
    .returning();
  return row;
};

export const findSessionByToken = async (db: DB, refreshToken: string) => {
  const hash = await sha256Hex(refreshToken);
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.refreshTokenHash, hash))
    .limit(1);
  return row;
};

export const findSessionById = async (db: DB, id: string) => {
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return row;
};

export const deleteSessionByToken = async (db: DB, refreshToken: string) => {
  await db
    .delete(sessions)
    .where(eq(sessions.refreshTokenHash, await sha256Hex(refreshToken)));
};

export const deleteSessionsOfUser = async (db: DB, userId: string) => {
  await db.delete(sessions).where(eq(sessions.userId, userId));
};

export const deleteSessionOfUser = async (
  db: DB,
  userId: string,
  sessionId: string
) => {
  await db
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.id, sessionId)));
};

export const deleteExpiredSessions = async (db: DB, now = new Date()) => {
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
};
