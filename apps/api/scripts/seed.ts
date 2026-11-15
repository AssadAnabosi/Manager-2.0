/**
 * Seeds the first administrator.
 *   bun apps/api/scripts/seed.ts --local | --remote
 * Inputs come from the environment or apps/api/.dev.vars. The password is never printed.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { hashPassword } from "../src/services/password";
import { apiDir, need, q, rowsOf, runSql, vars, type Target } from "./lib/d1";

const target = process.argv.includes("--remote")
  ? "--remote"
  : process.argv.includes("--local")
    ? "--local"
    : undefined;
if (!target) {
  console.error("Usage: bun apps/api/scripts/seed.ts --local | --remote");
  process.exit(1);
}

// --remote must use the rendered config (real database ID), see render-wrangler.ts
if (target === "--remote" && !existsSync(join(apiDir, "wrangler.deploy.jsonc"))) {
  console.error("Run `bun scripts/render-wrangler.ts` first (or use `bun run db:seed:remote`)");
  process.exit(1);
}

const check = runSql(
  target as Target,
  "SELECT COUNT(*) AS n FROM users WHERE role = 'Administrator';",
  ["--json"]
);
if (check.status !== 0) {
  console.error(check.stderr || check.stdout);
  process.exit(1);
}
if (((rowsOf(check.stdout)[0]?.n as number) ?? 0) > 0) {
  console.log("admin exists, skipping");
  process.exit(0);
}

const username = need("ADMIN_USERNAME").toLowerCase();
if (!/^[a-zA-Z0-9\-_.]+$/.test(username)) {
  console.error("ADMIN_USERNAME may only contain letters, digits, - _ .");
  process.exit(1);
}
const password = need("ADMIN_PASSWORD");
if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters");
  process.exit(1);
}

const passwordHash = await hashPassword(password, {
  PASSWORD_PEPPER: need("PASSWORD_PEPPER"),
  PASSWORD_PEPPER_VERSION: need("PASSWORD_PEPPER_VERSION"),
  PBKDF2_ITERATIONS: need("PBKDF2_ITERATIONS"),
});

const now = Date.now();
const sql = `INSERT INTO users (id, first_name, last_name, username, email, phone_number, password_hash, role, active, theme, language, created_at, updated_at) VALUES (${q(
  crypto.randomUUID()
)}, ${q(need("ADMIN_FIRSTNAME"))}, ${q(need("ADMIN_LASTNAME"))}, ${q(username)}, ${q(
  vars.ADMIN_EMAIL?.toLowerCase()
)}, ${q(vars.ADMIN_PHONE_NUMBER)}, ${q(passwordHash)}, 'Administrator', 1, 'system', 'ar', ${now}, ${now});\n`;

const run = runSql(target as Target, sql);
if (run.status !== 0) {
  console.error(run.stderr || run.stdout);
  process.exit(1);
}
console.log(`admin "${username}" created`);
