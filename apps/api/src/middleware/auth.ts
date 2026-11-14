import type { MiddlewareHandler } from "hono";
import { eq } from "drizzle-orm";
import type { Role } from "@workbench/shared";
import { getDb } from "../db";
import { users } from "../db/schema";
import { NOT_AUTHENTICATED, NOT_AUTHORIZED, NOT_FOUND, ResponseError } from "../lib/http";
import { findSessionById } from "../services/sessions";
import { verifyAccessToken } from "../services/tokens";
import type { AppEnv } from "../types";

/** Valid access token + existing session + existing, active user. Sets `user` and `sessionId`. */
export const isAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer") ? header.split(" ")[1] : undefined;
  if (!token) {
    throw new ResponseError(
      "Not Authenticated To Access This Route",
      NOT_AUTHENTICATED
    );
  }

  const result = await verifyAccessToken(c.env, token);
  if (result.status === "expired") {
    throw new ResponseError(
      "Token Expired, Please Refresh Token",
      NOT_AUTHORIZED
    );
  }
  if (result.status === "invalid") {
    throw new ResponseError("Please Login Again", NOT_AUTHENTICATED);
  }

  const db = getDb(c.env.DB);
  const session = await findSessionById(db, result.payload.sessionId);
  if (!session) throw new ResponseError("Please Login Again", NOT_AUTHENTICATED);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, result.payload.id))
    .limit(1);
  if (!user) throw new ResponseError("User Can Not Be Found", NOT_FOUND);
  if (!user.active) {
    throw new ResponseError("Your account has been deactivated", NOT_AUTHORIZED);
  }

  c.set("user", user);
  c.set("sessionId", session.id);
  await next();
};

const roleList = (roles: Role | readonly Role[]): readonly Role[] =>
  typeof roles === "string" ? [roles] : roles;

/** Authenticated, and (when `roles` is given) the role is one of `roles`. */
export const authorize = (roles: Role | readonly Role[] = []): MiddlewareHandler<AppEnv> => {
  const allowed = roleList(roles);
  return async (c, next) => {
    await isAuth(c, async () => {
      if (allowed.length && !allowed.includes(c.get("user").role)) {
        throw new ResponseError(
          "Not Authorized To Access This Route",
          NOT_AUTHORIZED
        );
      }
    });
    await next();
  };
};

/** Authenticated, and the role is NOT one of `roles`. */
export const notAuthorized = (roles: Role | readonly Role[] = []): MiddlewareHandler<AppEnv> => {
  const denied = roleList(roles);
  return async (c, next) => {
    await isAuth(c, async () => {
      if (denied.length && denied.includes(c.get("user").role)) {
        throw new ResponseError(
          "Not Authorized To Access This Route",
          NOT_AUTHORIZED
        );
      }
    });
    await next();
  };
};
