import { createRoute } from "@hono/zod-openapi";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import {
  authSuccessSchema,
  loginSchema,
  meSuccessSchema,
  messageSuccessSchema,
} from "@workbench/shared";
import { getDb } from "../db";
import {
  NOT_AUTHENTICATED,
  NOT_AUTHORIZED,
  NOT_FOUND,
  BAD_REQUEST,
  OK,
  TOO_MANY_REQUESTS,
  ResponseError,
  clientIp,
} from "../lib/http";
import { authorize } from "../middleware/auth";
import {
  getDummyHash,
  hashPassword,
  verifyPassword,
} from "../services/password";
import {
  clearUserAttempts,
  isLoginBlocked,
  recordFailedLogin,
} from "../services/rate-limit";
import {
  createSession,
  deleteSessionByToken,
  findSessionByToken,
} from "../services/sessions";
import {
  durationSeconds,
  refreshMaxAge,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../services/tokens";
import {
  findUserById,
  findUserByUsername,
  serializeUser,
  updatePasswordHash,
} from "../services/users";
import type { AppEnv } from "../types";
import {
  bearer,
  createRouter,
  errorResponse,
  jsonResponse,
  protectedErrors,
} from "./router";

const COOKIE = "refreshToken";

export const authRoutes = (prefix: string) => {
  const cookiePath = `${prefix}/auth`;

  const clearCookie = (c: Context<AppEnv>) =>
    deleteCookie(c, COOKIE, {
      path: cookiePath,
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
    });

  const me = createRoute({
    method: "get",
    path: "/auth",
    tags: ["Auth"],
    summary: "Current authenticated user",
    security: bearer,
    middleware: [authorize()],
    responses: {
      200: jsonResponse("The current user", meSuccessSchema),
      ...protectedErrors,
      404: errorResponse("User can not be found"),
    },
  });

  const login = createRoute({
    method: "post",
    path: "/auth",
    tags: ["Auth"],
    summary: "Log in",
    description:
      "Returns the user and an access token, and sets the refresh token cookie.",
    request: {
      body: { content: { "application/json": { schema: loginSchema } } },
    },
    responses: {
      200: jsonResponse("Logged in", authSuccessSchema),
      400: errorResponse("Validation error"),
      401: errorResponse("Invalid credentials"),
      403: errorResponse("Account deactivated"),
      429: errorResponse("Too many attempts"),
    },
  });

  const refresh = createRoute({
    method: "post",
    path: "/auth/refresh",
    tags: ["Auth"],
    summary: "Refresh the access token using the refresh cookie",
    responses: {
      200: jsonResponse("New access token", authSuccessSchema),
      400: errorResponse("Not logged in"),
      401: errorResponse("Session or token invalid or expired"),
      403: errorResponse("Account deactivated"),
      404: errorResponse("User account deleted"),
    },
  });

  const logout = createRoute({
    method: "delete",
    path: "/auth/logout",
    tags: ["Auth"],
    summary: "Log out and revoke the refresh token",
    responses: {
      200: jsonResponse("Logged out", messageSuccessSchema),
      400: errorResponse("Not logged in"),
    },
  });

  return createRouter()
    .openapi(me, (c) =>
      c.json({ success: true as const, data: { user: serializeUser(c.get("user")) } }, 200)
    )
    .openapi(login, async (c) => {
      const { username, password } = c.req.valid("json");
      const db = getDb(c.env.DB);
      const ip = clientIp(c);
      const name = username.toLowerCase();

      if (await isLoginBlocked(db, ip, name)) {
        throw new ResponseError("TOO_MANY_REQUESTS", TOO_MANY_REQUESTS);
      }

      const previous = getCookie(c, COOKIE);
      if (previous) await deleteSessionByToken(db, previous);

      const user = await findUserByUsername(db, name);
      // Always run exactly one verification so timing doesn't reveal unknown users.
      const stored = user?.passwordHash ?? (await getDummyHash(c.env));
      const { ok, needsRehash } = await verifyPassword(password, stored, c.env);

      if (!user || !ok) {
        await recordFailedLogin(db, ip, name);
        throw new ResponseError("AUTH_INVALID_CREDENTIALS", NOT_AUTHENTICATED);
      }
      // Checked only after the password matches, so it can't reveal deactivated usernames.
      if (!user.active) {
        throw new ResponseError("AUTH_ACCOUNT_DEACTIVATED", NOT_AUTHORIZED);
      }
      if (needsRehash) {
        await updatePasswordHash(db, user.id, await hashPassword(password, c.env));
      }
      await clearUserAttempts(db, name);

      const refreshToken = await signRefreshToken(c.env, { id: user.id });
      const maxAge = durationSeconds(refreshMaxAge(c.env));
      const session = await createSession(db, {
        userId: user.id,
        refreshToken,
        ipAddress: ip,
        expiresAt: new Date(Date.now() + maxAge * 1000),
      });
      const accessToken = await signAccessToken(c.env, {
        id: user.id,
        sessionId: session.id,
      });

      setCookie(c, COOKIE, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: cookiePath,
        maxAge,
      });

      return c.json(
        {
          success: true as const,
          message: `Welcome back, ${user.firstName} ${user.lastName}`,
          data: { user: serializeUser(user), accessToken },
        },
        OK
      );
    })
    .openapi(refresh, async (c) => {
      const token = getCookie(c, COOKIE);
      if (!token) throw new ResponseError("AUTH_NOT_LOGGED_IN", BAD_REQUEST);
      const db = getDb(c.env.DB);

      const result = await verifyRefreshToken(c.env, token);
      if (result.status === "expired") {
        clearCookie(c);
        await deleteSessionByToken(db, token);
        throw new ResponseError("AUTH_REFRESH_EXPIRED", NOT_AUTHENTICATED);
      }
      if (result.status === "invalid") {
        clearCookie(c);
        throw new ResponseError("AUTH_LOGIN_AGAIN", NOT_AUTHENTICATED);
      }

      const user = await findUserById(db, result.payload.id);
      if (!user) {
        clearCookie(c);
        throw new ResponseError("AUTH_USER_DELETED", NOT_FOUND);
      }
      // Same check as `authorize`, so a refresh can't revive a deactivated account.
      if (!user.active) {
        clearCookie(c);
        throw new ResponseError("AUTH_ACCOUNT_DEACTIVATED", NOT_AUTHORIZED);
      }
      const session = await findSessionByToken(db, token);
      if (!session) {
        clearCookie(c);
        throw new ResponseError("AUTH_LOGIN_AGAIN", NOT_AUTHENTICATED);
      }

      return c.json(
        {
          success: true as const,
          message: "Refreshed Access Token Successfully",
          data: {
            user: serializeUser(user),
            accessToken: await signAccessToken(c.env, {
              id: user.id,
              sessionId: session.id,
            }),
          },
        },
        OK
      );
    })
    .openapi(logout, async (c) => {
      const token = getCookie(c, COOKIE);
      if (!token) throw new ResponseError("AUTH_NOT_LOGGED_IN", BAD_REQUEST);
      await deleteSessionByToken(getDb(c.env.DB), token);
      clearCookie(c);
      return c.json(
        { success: true as const, message: "Logged out successfully" },
        OK
      );
    });
};
