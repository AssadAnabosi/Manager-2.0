# Development

## Quickstart (Docker)

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun install
bun run dev
```

`bun run dev` runs `docker compose watch`: a one-shot `migrate` service applies migrations and seeds the admin into a local D1 database, then `api` (`localhost:8787`) and `web` (`localhost:5173`) start with hot reload.

## Native (no Docker)

```bash
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun run db:migrate:local && bun run db:seed:local
bun run dev:native
```

## Scripts

| Script | Does |
| --- | --- |
| `dev` | `docker compose watch` |
| `dev:native` | API (`wrangler dev`) and web (`vite`) in parallel |
| `db:generate` | `drizzle-kit generate` |
| `db:migrate:local` | Apply migrations to the local D1 |
| `db:seed:local` | Seed the admin into the local D1 |
| `db:reset:local` | Delete local D1 state, migrate and seed |
| `typecheck` | `tsc --noEmit` in every workspace |
| `lint` | ESLint in every workspace |
| `test` | `vitest run` |
| `deploy` | Apply remote migrations and `wrangler deploy` |

## Local D1

State lives in `apps/api/.wrangler/state/v3/d1` (a Docker volume when using compose). `bun run db:reset:local` wipes it.

## Tests

API tests use `vitest` with `@cloudflare/vitest-pool-workers`; migrations are applied in setup and each test seeds its own data. Run with `bun run test`.

## Conventions

Branches: `feat/…`, `fix/…`, `chore/…`, `docs/…`, `ci/…`. Commits: `type(scope):message`.
