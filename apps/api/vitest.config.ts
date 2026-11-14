import path from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrations = await readD1Migrations(
    path.join(import.meta.dirname, "migrations")
  );
  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            ENVIRONMENT: "test",
            JWT_ISSUER: "https://api.example.com",
            ALLOWED_ORIGINS: "https://dash.example.com",
            JWT_ACCESS_SECRET: "test-access-secret-0123456789abcdef",
            JWT_REFRESH_SECRET: "test-refresh-secret-0123456789abcdef",
            PASSWORD_PEPPER: "dGVzdC1wZXBwZXItMDEyMzQ1Njc4OTAxMjM0NTY3ODk=",
            PASSWORD_PEPPER_VERSION: "1",
            PBKDF2_ITERATIONS: "1000",
          },
        },
      }),
    ],
    test: { setupFiles: ["./test/setup.ts"] },
  };
});
