# Development

## Quickstart (Docker)

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun install
bun run dev
```

`bun run dev` runs `docker compose watch` (Docker with Compose 2.22+; `apps/api/.dev.vars` is mounted read-only into the containers): a one-shot `migrate` service applies migrations and seeds the admin and the [demo data](dev-data.md) into a local D1 database, then `api` (`localhost:8787`) and `web` (`localhost:5173`) start with hot reload.

## Native (no Docker)

Requires Bun and Node.js (Wrangler's local runtime must run on Node; under Bun it can't forward requests to the Worker).

```bash
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun run db:migrate:local && bun run db:seed:local && bun run db:seed:dev
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
| `db:seed:dev` | Seed the date-relative demo data and its logins, see [dev-data.md](dev-data.md) (`-- --force` replaces it now) |
| `db:reset:local` | Delete local D1 state, migrate and seed (admin and demo data) |
| `typecheck` | `tsc --noEmit` in every workspace |
| `lint` | ESLint in every workspace |
| `test` | `vitest run` |
| `deploy` | Render the deploy config (see [deployment.md](deployment.md)), apply remote migrations and `wrangler deploy` |

## Hot reload

With Docker, changes under `apps/api/src`, `apps/web/src` and `packages/shared/src` are synced into the containers (no source bind mounts); changing a `package.json` or `bun.lock` rebuilds the image. The image installs dependencies at build time with `bun install --frozen-lockfile`.

## Local D1

State lives in `apps/api/.wrangler/state/v3/d1` (a Docker volume when using compose). `bun run db:reset:local` wipes it.

## Tests

API tests use `vitest` with `@cloudflare/vitest-pool-workers`; migrations are applied in setup and each test seeds its own data. Run with `bun run test`.

## Conventions

Branches: `feat/…`, `fix/…`, `chore/…`, `docs/…`, `ci/…`. Commits: `type(scope):message`.
