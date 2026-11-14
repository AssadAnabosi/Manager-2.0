import { createApp } from "./app";
import { getDb } from "./db";
import type { Env } from "./env";
import { getIterations } from "./services/password";
import { deleteOldAttempts } from "./services/rate-limit";
import { deleteExpiredSessions } from "./services/sessions";

let app: ReturnType<typeof createApp> | undefined;

/** Daily cleanup: expired sessions and old login-attempt windows. */
export const runCleanup = async (env: Env, now = Date.now()) => {
  const db = getDb(env.DB);
  await deleteExpiredSessions(db, new Date(now));
  await deleteOldAttempts(db, now);
};

export default {
  async fetch(request, env, ctx) {
    getIterations(env); // reject an invalid PBKDF2_ITERATIONS on every start
    app ??= createApp(env.API_PREFIX ?? "");
    return app.fetch(request, env, ctx);
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runCleanup(env));
  },
} satisfies ExportedHandler<Env>;
