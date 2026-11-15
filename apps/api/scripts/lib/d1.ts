/** Shared by the seed scripts: .dev.vars, SQL quoting and running SQL against the local D1. */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const apiDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const readDevVars = (): Record<string, string> => {
  const file = join(apiDir, ".dev.vars");
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !line.trim().startsWith("#"))
      out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
};

/** .dev.vars overridden by the environment. */
export const vars = {
  ...readDevVars(),
  ...(process.env as Record<string, string>),
};

export const need = (name: string): string => {
  const v = vars[name];
  if (!v) {
    console.error(`Missing required variable ${name}`);
    process.exit(1);
  }
  return v;
};

/** A SQL string literal (or NULL). */
export const q = (s: string | null | undefined) =>
  s ? `'${s.replace(/'/g, "''")}'` : "NULL";

export type Target = "--local" | "--remote";

export const wrangler = (target: Target, args: string[]) =>
  spawnSync(
    "bunx",
    [
      "wrangler",
      "d1",
      "execute",
      "workbench-db",
      ...(target === "--remote" ? ["--config", "wrangler.deploy.jsonc"] : []),
      ...args,
      target,
    ],
    { cwd: apiDir, encoding: "utf8", shell: process.platform === "win32" }
  );

/** SQL goes through files: passing it with --command breaks on Windows shells. */
export const runSql = (target: Target, sql: string, extra: string[] = []) => {
  const file = join(tmpdir(), `workbench-seed-${crypto.randomUUID()}.sql`);
  writeFileSync(file, sql);
  try {
    return wrangler(target, [...extra, "--file", file]);
  } finally {
    rmSync(file, { force: true });
  }
};

/** Rows of the last statement of a `--json` run. */
export const rowsOf = (out: string): Record<string, unknown>[] =>
  JSON.parse(out.slice(out.indexOf("[")))[0]?.results ?? [];
