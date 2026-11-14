import type { Env } from "../env";

export const MAX_ITERATIONS = 100_000;
const PREFIX = "pbkdf2-sha256";

export type PasswordEnv = Pick<
  Env,
  "PASSWORD_PEPPER" | "PASSWORD_PEPPER_VERSION" | "PBKDF2_ITERATIONS"
> &
  Record<string, unknown>;

const enc = new TextEncoder();

export const b64urlEncode = (bytes: Uint8Array): string => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const b64urlDecode = (s: string): Uint8Array => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** Parses and validates PBKDF2_ITERATIONS; Workers caps PBKDF2 at 100k. */
export const getIterations = (env: { PBKDF2_ITERATIONS: string }): number => {
  const n = Number(env.PBKDF2_ITERATIONS);
  if (!Number.isInteger(n) || n < 1 || n > MAX_ITERATIONS) {
    throw new Error(
      `PBKDF2_ITERATIONS must be an integer between 1 and ${MAX_ITERATIONS}`
    );
  }
  return n;
};

// HMAC keys are imported once per isolate and cached by pepper value.
const pepperKeys = new Map<string, Promise<CryptoKey>>();

const pepperKey = (pepperB64: string): Promise<CryptoKey> => {
  let key = pepperKeys.get(pepperB64);
  if (!key) {
    key = crypto.subtle.importKey(
      "raw",
      Uint8Array.from(atob(pepperB64), (c) => c.charCodeAt(0)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    pepperKeys.set(pepperB64, key);
  }
  return key;
};

const pepperFor = (env: PasswordEnv, version: string): string | undefined => {
  if (version === env.PASSWORD_PEPPER_VERSION) return env.PASSWORD_PEPPER;
  const retired = env[`PASSWORD_PEPPER_${version}`];
  return typeof retired === "string" ? retired : undefined;
};

const derive = async (
  password: string,
  pepperB64: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> => {
  const pw = password.normalize("NFKC");
  const peppered = await crypto.subtle.sign(
    "HMAC",
    await pepperKey(pepperB64),
    enc.encode(pw)
  );
  const base = await crypto.subtle.importKey("raw", peppered, "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base,
    256
  );
  return new Uint8Array(bits);
};

export const hashPassword = async (
  password: string,
  env: PasswordEnv
): Promise<string> => {
  const iterations = getIterations(env);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, env.PASSWORD_PEPPER, salt, iterations);
  return [
    PREFIX,
    env.PASSWORD_PEPPER_VERSION,
    iterations,
    b64urlEncode(salt),
    b64urlEncode(hash),
  ].join("$");
};

export const safeEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.byteLength === b.byteLength && crypto.subtle.timingSafeEqual(a, b);

export type VerifyResult = { ok: boolean; needsRehash: boolean };

export const verifyPassword = async (
  password: string,
  stored: string,
  env: PasswordEnv
): Promise<VerifyResult> => {
  const fail = { ok: false, needsRehash: false };
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== PREFIX) return fail;
  const [, version, iterStr, saltB64, hashB64] = parts;
  const iterations = Number(iterStr);
  if (
    !Number.isInteger(iterations) ||
    iterations < 1 ||
    iterations > MAX_ITERATIONS
  )
    return fail;
  const pepper = pepperFor(env, version);
  if (!pepper) return fail;

  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = b64urlDecode(saltB64);
    expected = b64urlDecode(hashB64);
  } catch {
    return fail;
  }
  const actual = await derive(password, pepper, salt, iterations);
  const ok = safeEqual(actual, expected);
  const needsRehash =
    ok &&
    (iterations !== getIterations(env) ||
      version !== env.PASSWORD_PEPPER_VERSION);
  return { ok, needsRehash };
};

// A constant hash made with the current settings, so a login for an unknown
// user costs the same as a login for a real one.
const dummyHashes = new Map<string, Promise<string>>();

export const getDummyHash = (env: PasswordEnv): Promise<string> => {
  const k = `${env.PASSWORD_PEPPER_VERSION}:${env.PBKDF2_ITERATIONS}`;
  let h = dummyHashes.get(k);
  if (!h) {
    h = hashPassword("dummy-password-for-timing-only", env);
    dummyHashes.set(k, h);
  }
  return h;
};
