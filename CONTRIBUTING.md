# Contributing

Thanks for helping out. Setup and scripts are in [docs/development.md](docs/development.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/web` | React + Vite PWA |
| `apps/api` | Cloudflare Worker (Hono, D1, Drizzle) |
| `packages/shared` | Zod schemas and types used by both apps |

## Shared schemas

Request and response shapes live once in `packages/shared` and are used by the API (validation and generated OpenAPI) and the web app. Don't duplicate a schema in an app.

## Database changes

- Edit `apps/api/src/db/schema.ts`, then run `bun run db:generate`.
- Commit the generated SQL and metadata in `apps/api/migrations/` with the schema change. Never edit an applied migration; add a new one.
- Money is stored as integer minor units and dates as epoch milliseconds; convert only through `src/lib/money.ts` and `src/lib/dates.ts`.

## API code

- Declare every route with `createRoute()` so it appears in the OpenAPI document.
- Responses use the `{ success, message?, data? }` envelope; errors are thrown as `ResponseError`.
- Never log request bodies or passwords.
- Add tests for the happy path and the 400/401/403/404/409 cases that apply, and for every role guard you touch.

## Checks

Before opening a pull request run:

```sh
bun run typecheck
bun run lint
bun run test
```

CI runs the same checks.

## Configuration

Keep real domains, secrets and account IDs out of Git. The repository uses `example.com` placeholders; real values belong in `.dev.vars` (local, gitignored), Wrangler secrets or CI variables.

## Commits and branches

- Commit messages: `type(scope):message`, e.g. `feat(api):add bills routes`.
- Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…`, `ci/…`.

## Dependencies

Update dependencies deliberately and, where practical, in their own pull request. Keep [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) up to date when adding a runtime dependency.
