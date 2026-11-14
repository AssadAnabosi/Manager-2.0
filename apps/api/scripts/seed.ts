/**
 * Seeds the first administrator.
 *   bun apps/api/scripts/seed.ts --local | --remote
 * Inputs come from the environment or apps/api/.dev.vars. The password is never printed.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../src/services/password";

const apiDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const readDevVars = (): Record<string, string> => {
  const file = join(apiDir, ".dev.vars");
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !line.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
};

const vars = { ...readDevVars(), ...(process.env as Record<string, string>) };
const need = (name: string): string => {
  const v = vars[name];
  if (!v) {
    console.error(`Missing required variable ${name}`);
    process.exit(1);
  }
  return v;
};

const target = process.argv.includes("--remote")
  ? "--remote"
  : process.argv.includes("--local")
    ? "--local"
    : undefined;
if (!target) {
  console.error("Usage: bun apps/api/scripts/seed.ts --local | --remote");
  process.exit(1);
}

const q = (s: string | undefined) =>
  s ? `'${s.replace(/'/g, "''")}'` : "NULL";

const wrangler = (args: string[]) =>
  spawnSync("bunx", ["wrangler", "d1", "execute", "workbench-db", ...args, target], {
    cwd: apiDir,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

const check = wrangler([
  "--json",
  "--command",
  "SELECT COUNT(*) AS n FROM users WHERE role = 'Administrator'",
]);
if (check.status !== 0) {
  console.error(check.stderr || check.stdout);
  process.exit(1);
}
const parsed = JSON.parse(check.stdout.slice(check.stdout.indexOf("[")));
if ((parsed[0]?.results?.[0]?.n ?? 0) > 0) {
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

const tmp = join(tmpdir(), `workbench-seed-${crypto.randomUUID()}.sql`);
writeFileSync(tmp, sql);
try {
  const run = wrangler(["--file", tmp]);
  if (run.status !== 0) {
    console.error(run.stderr || run.stdout);
    process.exit(1);
  }
  console.log(`admin "${username}" created`);
} finally {
  rmSync(tmp, { force: true });
}
