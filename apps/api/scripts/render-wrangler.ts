/**
 * Writes apps/api/wrangler.deploy.jsonc (gitignored): the committed wrangler.jsonc with your
 * real domain and database ID filled in, so they never have to be committed.
 *
 *   API_DOMAIN       e.g. api.mycompany.com   (Custom Domain of the Worker)
 *   WEB_ORIGIN       e.g. https://dash.mycompany.com   (space-separated for several)
 *   D1_DATABASE_ID   the ID printed by `wrangler d1 create workbench-db`
 *
 * Values come from the environment or apps/api/.dev.vars (never printed).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
  const v = vars[name]?.trim();
  if (!v) {
    console.error(`Missing required variable ${name} (see docs/deployment.md)`);
    process.exit(1);
  }
  return v;
};

const domain = need("API_DOMAIN").replace(/^https?:\/\//, "").replace(/\/+$/, "");
const origins = need("WEB_ORIGIN");
const databaseId = need("D1_DATABASE_ID");

if (/example\.com$/.test(domain)) {
  console.error("API_DOMAIN still points at the example.com placeholder");
  process.exit(1);
}

// wrangler.jsonc is plain JSON plus comments; the committed file has none.
const config = JSON.parse(readFileSync(join(apiDir, "wrangler.jsonc"), "utf8"));
config.routes = [{ pattern: domain, custom_domain: true }];
config.vars = {
  ...config.vars,
  JWT_ISSUER: `https://${domain}`,
  ALLOWED_ORIGINS: origins,
};
config.d1_databases = config.d1_databases.map((db: Record<string, unknown>) => ({
  ...db,
  database_id: databaseId,
}));
delete config.$schema;

writeFileSync(
  join(apiDir, "wrangler.deploy.jsonc"),
  JSON.stringify(config, null, 2) + "\n"
);
console.log("wrote wrangler.deploy.jsonc");
