# Deployment

Everything runs on Cloudflare's free plan.

## Your own domains

The repository only contains the placeholder domains `api.example.com` (API) and `dash.example.com` (web app). Replace them with your own in `apps/api/wrangler.jsonc` (`routes`, `JWT_ISSUER`, `ALLOWED_ORIGINS`) and in the Pages `VITE_API_URL`. Keep your real values out of Git: use a local, gitignored copy of the config (`wrangler deploy --config`) or, for CI, the repository variables described below.

## One-time setup

1. **Pages (web app)**: root directory `apps/web`, build command `bun install --frozen-lockfile && bun run build`, output `dist`, environment variables `BUN_VERSION=1.3.4`, `VITE_API_URL=https://api.example.com`, `VITE_APP_TITLE=Workbench`. Pages deploys from Git; GitHub Actions does not build the web app.
2. **D1**: `wrangler d1 create workbench-db`, then put the `database_id` in `apps/api/wrangler.jsonc`.
3. **Secrets**: `wrangler secret put` for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PASSWORD_PEPPER`, `PASSWORD_PEPPER_VERSION`.
4. **First deploy**: `bun run deploy` from the repo root. The `routes` entry in `wrangler.jsonc` attaches the Custom Domain `api.example.com` (`workers.dev` and preview URLs are disabled).
5. **Seed the admin**: `bun apps/api/scripts/seed.ts --remote` with the admin variables set.
6. **WAF rate limiting rule** (free plan allows one): path equals `/auth`, method POST, counted per IP, more than 10 requests in 10 seconds, block for 10 seconds.
7. **Password iterations**: deploy once with `BENCH=true`, call `/__bench/pbkdf2?n=` for several values and read CPU time in Workers Logs, then set `PBKDF2_ITERATIONS` to the highest value that keeps a full `POST /auth` at roughly 8 ms or less and redeploy without `BENCH`.
8. **GitHub secrets** for CI deploys: `CLOUDFLARE_API_TOKEN` (Workers + D1 edit) and `CLOUDFLARE_ACCOUNT_ID`.

## CI

- `ci.yml` (pull requests): install with `--frozen-lockfile`, typecheck, lint, test, then `wrangler deploy --dry-run`.
- `deploy.yml` (push to `main` touching `apps/api/**` or `packages/shared/**`): apply remote D1 migrations, then `wrangler deploy`.
