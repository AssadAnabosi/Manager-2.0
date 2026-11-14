import { eq } from "drizzle-orm";
import type { UserDTO } from "@workbench/shared";
import type { DB } from "../db";
import { users, type UserRow } from "../db/schema";

/** Public shape of a user: no password hash, no `active`, absent optionals omitted. */
export const serializeUser = (u: UserRow): UserDTO => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  fullName: `${u.firstName} ${u.lastName}`,
  username: u.username,
  ...(u.email ? { email: u.email } : {}),
  ...(u.phoneNumber ? { phoneNumber: u.phoneNumber } : {}),
  role: u.role,
  theme: u.theme as UserDTO["theme"],
  language: u.language as UserDTO["language"],
});

export const findUserByUsername = async (db: DB, username: string) => {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);
  return row;
};

export const findUserById = async (db: DB, id: string) => {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row;
};

export const updatePasswordHash = async (db: DB, id: string, hash: string) => {
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, id));
};
