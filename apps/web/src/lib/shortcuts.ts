/**
 * Keyboard shortcuts must not depend on the keyboard layout: on an Arabic layout the C key
 * types ؤ (Windows) or ذ (Mac), and the key that types ? in English types ؟. So a letter is
 * read from the typed character when it is a Latin one, and from the physical key otherwise.
 */
export const letterOf = (e: KeyboardEvent): string => {
  if (/^[a-z]$/i.test(e.key)) return e.key.toLowerCase();
  const code = /^Key([A-Z])$/.exec(e.code)?.[1];
  return (code ?? e.key).toLowerCase();
};

/** A plain letter shortcut, e.g. `isLetter(e, "k")`. */
export const isLetter = (e: KeyboardEvent, letter: string) =>
  letterOf(e) === letter;

/** `[`, `]` or `\`, whatever the layout types on those keys. */
export const punctuationOf = (e: KeyboardEvent): string => {
  if (e.code === "BracketLeft") return "[";
  if (e.code === "BracketRight") return "]";
  if (e.code === "Backslash") return "\\";
  return e.key;
};

/** The key for "show the shortcuts": ? in English, ؟ in Arabic. */
export const isHelpKey = (e: KeyboardEvent) =>
  e.key === "?" || e.key === "؟" || (e.code === "Slash" && e.shiftKey);

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** What the C and B keys type on the Arabic layouts of Windows and macOS. */
const PREFIXES: [string, string[]][] = [
  ["c", ["ؤ", "ذ"]],
  ["b", ["ز", "لا", "ﻵ"]],
];

/**
 * The text of the command menu as if it had been typed on an English keyboard: Arabic digits
 * become 0-9 and the Arabic C and B keys become c and b, so "ؤ250" reads as "c250".
 */
export function normalizeQuery(text: string): string {
  let out = "";
  for (const ch of text) {
    const digit = ARABIC_DIGITS.indexOf(ch);
    out += digit >= 0 ? digit : ch === "٫" ? "." : ch;
  }
  const trimmed = out.trimStart();
  for (const [latin, arabic] of PREFIXES) {
    const hit = arabic.find((a) => trimmed.startsWith(a));
    if (hit) return latin + trimmed.slice(hit.length);
  }
  return out;
}
