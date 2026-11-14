import type { Env } from "../env";

/** True only for `wrangler dev` (ENVIRONMENT=development in .dev.vars). */
export const isDevelopment = (env: Pick<Env, "ENVIRONMENT">) =>
  env.ENVIRONMENT === "development";

// http(s) on localhost or a private LAN address (10/8, 172.16/12, 192.168/16, .local), any port
const LAN_ORIGIN =
  /^https?:\/\/(localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|[a-z0-9-]+\.local)(:\d{1,5})?$/i;

/** In development the web app may be opened from another device on the local network. */
export const isLanOrigin = (origin: string) => LAN_ORIGIN.test(origin);

/**
 * Browsers drop `Secure` cookies on plain http, which is what a LAN address is, so the
 * refresh cookie is only marked Secure outside development.
 */
export const cookieSecure = (env: Pick<Env, "ENVIRONMENT">) =>
  !isDevelopment(env);
