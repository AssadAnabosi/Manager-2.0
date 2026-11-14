import { createRoute, z } from "@hono/zod-openapi";
import { and, asc, eq, or, type SQL } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";
import {
  ADMIN,
  MODERATOR,
  SPECTATOR,
  checkUsernameSchema,
  messageSuccessSchema,
  preferencesSchema,
  registerUserSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateRoleSchema,
  updateStatusSchema,
  updateUserSchema,
  userDetailSchema,
} from "@workbench/shared";
import { getDb } from "../db";
import { users, type UserRow } from "../db/schema";
import {
  BAD_REQUEST,
  CREATED,
  NO_CONTENT,
  OK,
  ResponseError,
  capitalize,
} from "../lib/http";
import { containsLike, nullIfEmpty } from "../lib/query";
import { authorize } from "../middleware/auth";
import { paramRecord } from "../middleware/params";
import { hashPassword, verifyPassword } from "../services/password";
import { deleteSessionsOfUser } from "../services/sessions";
import { serializeUser } from "../services/users";
import {
  bearer,
  createRouter,
  errorResponse,
  jsonResponse,
  protectedErrors,
} from "./router";

const serializeUserDetail = (u: UserRow) => ({
  ...serializeUser(u),
  active: u.active,
});

const usersListSchema = z.object({
  success: z.literal(true),
  data: z.object({ users: z.array(userDetailSchema), search: z.string() }),
});
const userGetSchema = z.object({
  success: z.literal(true),
  data: z.object({ user: userDetailSchema }),
});
const availabilitySchema = z.object({
  success: z.literal(true),
  data: z.object({ isAvailable: z.boolean() }),
});
const preferencesResultSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({ theme: z.string(), language: z.string() }),
});

const params = z.object({ userID: z.string() });
const mount = authorize();
const viewers = authorize([SPECTATOR, MODERATOR, ADMIN]);
const creators = authorize([MODERATOR, ADMIN]);
const admin = authorize([ADMIN]);
const load = paramRecord("userID", users);
const badId = {
  400: errorResponse("Validation error or malformed ID"),
  404: errorResponse("User not found"),
};

const body = <T extends z.ZodType>(schema: T) => ({
  content: { "application/json": { schema } },
});

export const usersRoutes = (prefix: string) => {
  const list = createRoute({
    method: "get",
    path: "/users",
    tags: ["Users"],
    summary: "List users",
    security: bearer,
    middleware: [mount, viewers],
    request: {
      query: z.object({
        search: z.string().optional(),
        active: z.enum(["true", "false"]).optional(),
      }),
    },
    responses: {
      200: jsonResponse("Users", usersListSchema),
      ...protectedErrors,
    },
  });
  const register = createRoute({
    method: "post",
    path: "/users",
    tags: ["Users"],
    summary: "Create a user",
    security: bearer,
    middleware: [mount, creators],
    request: { body: body(registerUserSchema) },
    responses: {
      201: { description: "Created" },
      400: errorResponse("Validation error"),
      409: errorResponse("Username is already taken"),
      ...protectedErrors,
    },
  });
  const checkUsername = createRoute({
    method: "post",
    path: "/users/check-username",
    tags: ["Users"],
    summary: "Check whether a username is available",
    security: bearer,
    middleware: [mount, creators],
    request: { body: body(checkUsernameSchema) },
    responses: {
      200: jsonResponse("Availability", availabilitySchema),
      400: errorResponse("Validation error"),
      ...protectedErrors,
    },
  });
  const changePassword = createRoute({
    method: "patch",
    path: "/users/password",
    tags: ["Users"],
    summary: "Change your own password (revokes all your sessions)",
    security: bearer,
    middleware: [mount],
    request: { body: body(updatePasswordSchema) },
    responses: {
      200: jsonResponse("Password changed", messageSuccessSchema),
      400: errorResponse("Validation error or wrong current password"),
      ...protectedErrors,
    },
  });
  const preferences = createRoute({
    method: "patch",
    path: "/users/preferences",
    tags: ["Users"],
    summary: "Update your own theme and language",
    security: bearer,
    middleware: [mount],
    request: { body: body(preferencesSchema) },
    responses: {
      200: jsonResponse("Preferences updated", preferencesResultSchema),
      400: errorResponse("Validation error"),
      ...protectedErrors,
    },
  });
  const get = createRoute({
    method: "get",
    path: "/users/{userID}",
    tags: ["Users"],
    summary: "Get a user",
    security: bearer,
    middleware: [mount, viewers, load],
    request: { params },
    responses: {
      200: jsonResponse("The user", userGetSchema),
      ...badId,
      ...protectedErrors,
    },
  });
  const update = createRoute({
    method: "put",
    path: "/users/{userID}",
    tags: ["Users"],
    summary: "Update a user's details (not password, role or status)",
    security: bearer,
    middleware: [mount, admin, load],
    request: { params, body: body(updateUserSchema) },
    responses: {
      204: { description: "Updated" },
      409: errorResponse("Username is already taken"),
      ...badId,
      ...protectedErrors,
    },
  });
  const remove = createRoute({
    method: "delete",
    path: "/users/{userID}",
    tags: ["Users"],
    summary: "Delete a user and their logs and sessions",
    security: bearer,
    middleware: [mount, admin, load],
    request: { params },
    responses: {
      204: { description: "Deleted" },
      ...badId,
      ...protectedErrors,
    },
  });
  const resetPassword = createRoute({
    method: "patch",
    path: "/users/{userID}/password",
    tags: ["Users"],
    summary: "Reset a user's password (revokes all their sessions)",
    security: bearer,
    middleware: [mount, admin, load],
    request: { params, body: body(resetPasswordSchema) },
    responses: {
      204: { description: "Password reset" },
      ...badId,
      ...protectedErrors,
    },
  });
  const setRole = createRoute({
    method: "patch",
    path: "/users/{userID}/role",
    tags: ["Users"],
    summary: "Change a user's role (not your own)",
    security: bearer,
    middleware: [mount, admin, load],
    request: { params, body: body(updateRoleSchema) },
    responses: {
      204: { description: "Role updated" },
      ...badId,
      ...protectedErrors,
    },
  });
  const setStatus = createRoute({
    method: "patch",
    path: "/users/{userID}/status",
    tags: ["Users"],
    summary: "Activate or deactivate a user (not yourself)",
    security: bearer,
    middleware: [mount, admin, load],
    request: { params, body: body(updateStatusSchema) },
    responses: {
      204: { description: "Status updated" },
      ...badId,
      ...protectedErrors,
    },
  });

  return createRouter()
    .openapi(list, async (c) => {
      const { search = "", active } = c.req.valid("query");
      const conditions: SQL[] = [
        or(
          containsLike(users.firstName, search),
          containsLike(users.lastName, search)
        )!,
      ];
      if (active) conditions.push(eq(users.active, active === "true"));
      const rows = await getDb(c.env.DB)
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(asc(users.createdAt));
      return c.json(
        {
          success: true as const,
          data: { users: rows.map(serializeUserDetail), search },
        },
        OK
      );
    })
    .openapi(register, async (c) => {
      const input = c.req.valid("json");
      await getDb(c.env.DB)
        .insert(users)
        .values({
          firstName: capitalize(input.firstName),
          lastName: capitalize(input.lastName),
          username: input.username.toLowerCase(),
          email: nullIfEmpty(input.email)?.toLowerCase() ?? null,
          phoneNumber: nullIfEmpty(input.phoneNumber),
          passwordHash: await hashPassword(input.password, c.env),
        });
      return c.body(null, CREATED);
    })
    .openapi(checkUsername, async (c) => {
      const { username } = c.req.valid("json");
      const [existing] = await getDb(c.env.DB)
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username.toLowerCase()))
        .limit(1);
      return c.json(
        { success: true as const, data: { isAvailable: !existing } },
        OK
      );
    })
    .openapi(changePassword, async (c) => {
      const { current, new: next } = c.req.valid("json");
      const me = c.get("user");
      const { ok } = await verifyPassword(current, me.passwordHash, c.env);
      if (!ok) {
        throw new ResponseError("CURRENT_PASSWORD_INVALID", BAD_REQUEST);
      }
      const db = getDb(c.env.DB);
      await db
        .update(users)
        .set({ passwordHash: await hashPassword(next, c.env) })
        .where(eq(users.id, me.id));
      await deleteSessionsOfUser(db, me.id);
      deleteCookie(c, "refreshToken", {
        path: `${prefix}/auth`,
        secure: true,
        httpOnly: true,
        sameSite: "Strict",
      });
      return c.json(
        { success: true as const, message: "Password changed successfully" },
        OK
      );
    })
    .openapi(preferences, async (c) => {
      const { theme, language } = c.req.valid("json");
      await getDb(c.env.DB)
        .update(users)
        .set({ theme, language })
        .where(eq(users.id, c.get("user").id));
      return c.json(
        {
          success: true as const,
          message: "Preferences updated successfully",
          data: { theme, language },
        },
        OK
      );
    })
    .openapi(get, (c) =>
      c.json(
        {
          success: true as const,
          data: { user: serializeUserDetail(c.get("record")) },
        },
        OK
      )
    )
    .openapi(update, async (c) => {
      const input = c.req.valid("json");
      const set: Partial<typeof users.$inferInsert> = {};
      if (input.firstName !== undefined) set.firstName = capitalize(input.firstName);
      if (input.lastName !== undefined) set.lastName = capitalize(input.lastName);
      if (input.username !== undefined) set.username = input.username.toLowerCase();
      if (input.email !== undefined)
        set.email = nullIfEmpty(input.email)?.toLowerCase() ?? null;
      if (input.phoneNumber !== undefined)
        set.phoneNumber = nullIfEmpty(input.phoneNumber);
      if (input.theme !== undefined) set.theme = input.theme;
      if (input.language !== undefined) set.language = input.language;
      if (Object.keys(set).length) {
        await getDb(c.env.DB)
          .update(users)
          .set(set)
          .where(eq(users.id, c.get("record").id));
      }
      return c.body(null, NO_CONTENT);
    })
    .openapi(remove, async (c) => {
      const target = c.get("record") as UserRow;
      if (target.id === c.get("user").id) {
        throw new ResponseError("CANNOT_DELETE_SELF", BAD_REQUEST);
      }
      // logs and sessions are removed by ON DELETE CASCADE
      await getDb(c.env.DB).delete(users).where(eq(users.id, target.id));
      return c.body(null, NO_CONTENT);
    })
    .openapi(resetPassword, async (c) => {
      const target = c.get("record") as UserRow;
      const { password } = c.req.valid("json");
      const db = getDb(c.env.DB);
      await db
        .update(users)
        .set({ passwordHash: await hashPassword(password, c.env) })
        .where(eq(users.id, target.id));
      await deleteSessionsOfUser(db, target.id);
      return c.body(null, NO_CONTENT);
    })
    .openapi(setRole, async (c) => {
      const target = c.get("record") as UserRow;
      if (target.id === c.get("user").id) {
        throw new ResponseError("CANNOT_CHANGE_OWN_ROLE", BAD_REQUEST);
      }
      await getDb(c.env.DB)
        .update(users)
        .set({ role: c.req.valid("json").role })
        .where(eq(users.id, target.id));
      return c.body(null, NO_CONTENT);
    })
    .openapi(setStatus, async (c) => {
      const target = c.get("record") as UserRow;
      if (target.id === c.get("user").id) {
        throw new ResponseError("CANNOT_DEACTIVATE_SELF", BAD_REQUEST);
      }
      await getDb(c.env.DB)
        .update(users)
        .set({ active: c.req.valid("json").active })
        .where(eq(users.id, target.id));
      return c.body(null, NO_CONTENT);
    });
};
