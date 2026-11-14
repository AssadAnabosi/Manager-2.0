/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../node_modules/@cloudflare/vitest-plugin/types/cloudflare-test.d.ts" />

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    TEST_MIGRATIONS: import("@cloudflare/vitest-plugin").D1Migration[];
  }
}
