# Deployment

Everything runs on Cloudflare's free plan.

## Your own domains

The repository only contains the placeholder domains `api.example.com` (API) and `dash.example.com` (web app). Your real values are supplied at deploy time and never committed. `apps/api/scripts/render-wrangler.ts` copies `wrangler.jsonc` to the gitignored `wrangler.deploy.jsonc` with these filled in:

| Variable | Example | Used for |
| --- | --- | --- |
| `API_DOMAIN` | `api.mycompany.com` | the Worker's Custom Domain and `JWT_ISSUER` |
| `WEB_ORIGIN` | `https://dash.mycompany.com` | `ALLOWED_ORIGINS` (space-separated for several) |
| `D1_DATABASE_ID` | `xxxxxxxx-xxxx-…` | the D1 binding |

Set them in your shell or in `apps/api/.dev.vars` for manual deploys, and as repository **variables** for CI. Set the same API URL as `VITE_API_URL` in the Pages project.

## One-time setup

1. **Pages (web app)**: root directory `apps/web`, build command `bun install --frozen-lockfile && bun run build`, output `dist`, environment variables `BUN_VERSION=1.3.4`, `VITE_API_URL=https://api.example.com`, `VITE_APP_TITLE=Workbench`. Pages deploys from Git; GitHub Actions does not build the web app.
2. **D1**: `wrangler d1 create workbench-db`, then keep the printed `database_id` as `D1_DATABASE_ID` (it is not committed).
3. **Secrets**: `wrangler secret put` for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PASSWORD_PEPPER`, `PASSWORD_PEPPER_VERSION`.
4. **First deploy**: `bun run deploy` from the repo root (renders the config, applies remote migrations, deploys). The rendered `routes` entry attaches your Custom Domain (`workers.dev` and preview URLs are disabled).
5. **Seed the admin**: `bun apps/api/scripts/seed.ts --remote` with the admin variables set.
6. **WAF rate limiting rule** (free plan allows one): path equals `/auth`, method POST, counted per IP, more than 10 requests in 10 seconds, block for 10 seconds.
7. **Password iterations**: deploy once with `BENCH=true`, call `/__bench/pbkdf2?n=` for several values and read CPU time in Workers Logs, then set `PBKDF2_ITERATIONS` to the highest value that keeps a full `POST /auth` at roughly 8 ms or less and redeploy without `BENCH`.
8. **GitHub settings** for CI deploys: secrets `CLOUDFLARE_API_TOKEN` (Workers + D1 edit) and `CLOUDFLARE_ACCOUNT_ID`; variables `API_DOMAIN`, `WEB_ORIGIN` and `D1_DATABASE_ID`.

## CI

- `ci.yml` (pull requests): install with `--frozen-lockfile`, typecheck, lint, test, build the web app, then `wrangler deploy --dry-run`.
- `deploy.yml` (push to `main` touching `apps/api/**` or `packages/shared/**`): render the config from the repository variables, apply remote D1 migrations, then `wrangler deploy`.
