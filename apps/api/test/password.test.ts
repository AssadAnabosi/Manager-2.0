import { describe, expect, it } from "vitest";
import {
  getDummyHash,
  getIterations,
  hashPassword,
  verifyPassword,
} from "../src/services/password";
import { baseEnv } from "./helpers";

const env = baseEnv();

describe("password hashing", () => {
  it("uses the documented stored format", async () => {
    const stored = await hashPassword("a long enough password", env);
    const parts = stored.split("$");
    expect(parts).toHaveLength(5);
    expect(parts[0]).toBe("pbkdf2-sha256");
    expect(parts[1]).toBe("1");
    expect(parts[2]).toBe("1000");
    expect(parts[3]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(parts[4]).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("verifies the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("a long enough password", env);
    expect(await verifyPassword("a long enough password", stored, env)).toEqual({
      ok: true,
      needsRehash: false,
    });
    expect((await verifyPassword("another long password", stored, env)).ok).toBe(false);
  });

  it("salts every hash", async () => {
    const a = await hashPassword("same password here", env);
    const b = await hashPassword("same password here", env);
    expect(a).not.toBe(b);
  });

  it("treats NFKC-equivalent inputs as the same password", async () => {
    const stored = await hashPassword("oﬃce password", env); // contains the ffi ligature
    expect((await verifyPassword("office password", stored, env)).ok).toBe(true);
  });

  it("flags a re-hash when the iteration count or pepper version changed", async () => {
    const stored = await hashPassword("a long enough password", env);
    const moreIterations = { ...env, PBKDF2_ITERATIONS: "2000" };
    expect(await verifyPassword("a long enough password", stored, moreIterations)).toEqual({
      ok: true,
      needsRehash: true,
    });
    const rotated = {
      ...env,
      PASSWORD_PEPPER_VERSION: "2",
      PASSWORD_PEPPER: "bmV3LXBlcHBlci0wMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=",
      PASSWORD_PEPPER_1: env.PASSWORD_PEPPER,
    };
    expect(await verifyPassword("a long enough password", stored, rotated)).toEqual({
      ok: true,
      needsRehash: true,
    });
  });

  it("fails (not throws) when the stored pepper version is unknown", async () => {
    const stored = await hashPassword("a long enough password", env);
    const rotated = { ...env, PASSWORD_PEPPER_VERSION: "2" };
    expect((await verifyPassword("a long enough password", stored, rotated)).ok).toBe(false);
  });

  it.each(["", "garbage", "pbkdf2-sha256$1$abc$x$y", "bcrypt$1$1000$a$b", "pbkdf2-sha256$1$1000$!!$!!"])(
    "returns false for malformed stored value %j",
    async (stored) => {
      expect((await verifyPassword("whatever password", stored, env)).ok).toBe(false);
    }
  );

  it("rejects an iteration count above the Workers cap", () => {
    expect(() => getIterations({ PBKDF2_ITERATIONS: "100001" })).toThrow();
    expect(() => getIterations({ PBKDF2_ITERATIONS: "0" })).toThrow();
    expect(() => getIterations({ PBKDF2_ITERATIONS: "abc" })).toThrow();
    expect(getIterations({ PBKDF2_ITERATIONS: "100000" })).toBe(100000);
  });

  it("builds one dummy hash per settings combination", async () => {
    expect(await getDummyHash(env)).toBe(await getDummyHash(env));
  });
});
