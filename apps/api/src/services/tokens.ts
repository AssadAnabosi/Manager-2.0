import { SignJWT, jwtVerify, errors } from "jose";
import ms from "ms";
import type { Env } from "../env";

const enc = new TextEncoder();

export const durationSeconds = (value: string): number => {
  const millis = ms(value as ms.StringValue) as unknown;
  if (typeof millis !== "number" || !(millis > 0)) {
    throw new Error(`Invalid duration: ${value}`);
  }
  return Math.floor(millis / 1000);
};

export const accessExpire = (env: Env) => env.JWT_ACCESS_EXPIRE || "15m";
export const refreshMaxAge = (env: Env) => env.REFRESH_MAX_AGE || "30d";

export const signAccessToken = (
  env: Env,
  payload: { id: string; sessionId: string }
): Promise<string> =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(env.JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + durationSeconds(accessExpire(env))
    )
    .sign(enc.encode(env.JWT_ACCESS_SECRET));

export const signRefreshToken = (
  env: Env,
  payload: { id: string }
): Promise<string> =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(env.JWT_ISSUER)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + durationSeconds(refreshMaxAge(env))
    )
    .sign(enc.encode(env.JWT_REFRESH_SECRET));

export type VerifyOutcome<T> =
  | { status: "valid"; payload: T }
  | { status: "expired" }
  | { status: "invalid" };

const verify = async <T>(
  token: string,
  secret: string,
  issuer: string
): Promise<VerifyOutcome<T>> => {
  try {
    const { payload } = await jwtVerify(token, enc.encode(secret), {
      issuer,
      algorithms: ["HS256"],
    });
    return { status: "valid", payload: payload as T };
  } catch (e) {
    if (e instanceof errors.JWTExpired) return { status: "expired" };
    return { status: "invalid" };
  }
};

export const verifyAccessToken = (env: Env, token: string) =>
  verify<{ id: string; sessionId: string }>(
    token,
    env.JWT_ACCESS_SECRET,
    env.JWT_ISSUER
  );

export const verifyRefreshToken = (env: Env, token: string) =>
  verify<{ id: string }>(token, env.JWT_REFRESH_SECRET, env.JWT_ISSUER);
