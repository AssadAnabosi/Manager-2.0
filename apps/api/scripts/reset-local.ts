/** Deletes the local D1 state so `db:reset:local` can migrate and seed from scratch. */
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const state = join(dirname(fileURLToPath(import.meta.url)), "..", ".wrangler", "state", "v3", "d1");
rmSync(state, { recursive: true, force: true });
console.log(`removed ${state}`);
