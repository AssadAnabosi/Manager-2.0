/**
 * Writes apps/web/wrangler.deploy.jsonc (gitignored): the committed wrangler.jsonc with your
 * real domain, so it never has to be committed.
 *
 *   WEB_ORIGIN   e.g. https://dash.mycompany.com   (the first origin is used as the domain)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const origin = (process.env.WEB_ORIGIN ?? "").trim().split(/\s+/)[0];
if (!origin) {
  console.error("Missing required variable WEB_ORIGIN (see docs/deployment.md)");
  process.exit(1);
}
const domain = origin.replace(/^https?:\/\//, "").replace(/\/+$/, "");
if (/example\.com$/.test(domain)) {
  console.error("WEB_ORIGIN still points at the example.com placeholder");
  process.exit(1);
}

const config = JSON.parse(readFileSync(join(webDir, "wrangler.jsonc"), "utf8"));
config.routes = [{ pattern: domain, custom_domain: true }];
delete config.$schema;

writeFileSync(join(webDir, "wrangler.deploy.jsonc"), JSON.stringify(config, null, 2) + "\n");
console.log("wrote wrangler.deploy.jsonc");
