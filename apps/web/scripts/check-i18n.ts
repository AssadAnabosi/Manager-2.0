/**
 * Fails when a literal `t("...")` key is missing from a locale file, or when the
 * locale files do not have the same keys.
 *   bun scripts/check-i18n.ts          # check
 *   bun scripts/check-i18n.ts --unused # also list keys no literal t() uses
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { ERROR_CODES, VALIDATION_CODES } from "@workbench/shared";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(webDir, "src");
const LOCALES = ["en", "ar"] as const;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });

// t("key") and i18n.t("key"); keys with interpolation use {{name}} inside the string
const T_CALL = /(?<![\w.])(?:i18n\.)?t\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;

const used = new Map<string, string>();
for (const file of walk(srcDir)) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(T_CALL)) {
    const key = match[2];
    if (match[1] === "`" && key.includes("${")) continue; // dynamic key
    if (!used.has(key)) used.set(key, file.slice(webDir.length + 1));
  }
}

const locales = Object.fromEntries(
  LOCALES.map((lng) => [
    lng,
    JSON.parse(
      readFileSync(
        join(webDir, "public/locales", lng, "translation.json"),
        "utf8"
      )
    ) as Record<string, string>,
  ])
);

// Keys built at runtime from the API's error and validation codes (see src/lib/api-error.ts).
for (const code of ERROR_CODES)
  used.set(`errors.${code}`, "@workbench/shared errors");
for (const code of VALIDATION_CODES)
  used.set(`validation.${code}`, "@workbench/shared errors");

let failed = false;
const report = (title: string, items: string[]) => {
  if (!items.length) return;
  failed = true;
  console.error(`\n${title} (${items.length})`);
  for (const item of items) console.error(`  - ${item}`);
};

for (const lng of LOCALES) {
  report(
    `Used in code but missing from ${lng}`,
    [...used]
      .filter(([key]) => !(key in locales[lng]))
      .map(([k, f]) => `${k}  (${f})`)
  );
}

const [a, b] = LOCALES;
report(
  `In ${a} but not ${b}`,
  Object.keys(locales[a]).filter((k) => !(k in locales[b]))
);
report(
  `In ${b} but not ${a}`,
  Object.keys(locales[b]).filter((k) => !(k in locales[a]))
);

if (process.argv.includes("--unused")) {
  const unused = Object.keys(locales.en).filter((k) => !used.has(k));
  console.log(
    `\nNot referenced by a literal t() call (${unused.length}); some are dynamic:`
  );
  for (const key of unused) console.log(`  - ${key}`);
}

if (failed) process.exit(1);
console.log(
  `i18n OK: ${used.size} keys used, ${Object.keys(locales.en).length} per locale`
);
