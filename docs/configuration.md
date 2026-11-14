# Configuration

## API (`apps/api`)

Non-secret values are `vars` in `wrangler.jsonc`; secrets are set with `wrangler secret put` (production) or in `apps/api/.dev.vars` (local, gitignored).

| Name | Kind | Default | Purpose |
| --- | --- | --- | --- |
| `ENVIRONMENT` | var | `production` | Reported by `GET /`. With `development` the API also accepts CORS origins from localhost and private network addresses (any port) and sets the refresh cookie without `Secure`, see below |
| `API_PREFIX` | var | `""` | Optional prefix for every route, the cookie `Path` and the OpenAPI server URL |
| `API_DOCS` | var | off | Only `"true"` serves `/openapi.json` and `/docs`; leave unset or `"false"` in production |
| `JWT_ISSUER` | var | `https://api.example.com` (replace with your API origin) | JWT issuer |
| `JWT_ACCESS_EXPIRE` | var | `15m` | Access token lifetime |
| `REFRESH_MAX_AGE` | var | `30d` | Refresh token lifetime and cookie max-age |
| `ALLOWED_ORIGINS` | var | `https://dash.example.com` | Space-separated exact CORS origins |
| `PBKDF2_ITERATIONS` | var | `30000` | Password hash iterations (max 100000) |
| `JWT_ACCESS_SECRET` | secret | | Signs access tokens |
| `JWT_REFRESH_SECRET` | secret | | Signs refresh tokens |
| `PASSWORD_PEPPER` | secret | | 32 random bytes, base64 |
| `PASSWORD_PEPPER_VERSION` | secret | `1` | Pepper version stored in each hash |

## Seed script

Read from the environment or `.dev.vars` when running `apps/api/scripts/seed.ts`:

`ADMIN_USERNAME`, `ADMIN_PASSWORD` (required, at least 12 characters, no default), `ADMIN_FIRSTNAME`, `ADMIN_LASTNAME`, `ADMIN_EMAIL`, `ADMIN_PHONE_NUMBER`, plus `PASSWORD_PEPPER`, `PASSWORD_PEPPER_VERSION` and `PBKDF2_ITERATIONS`.

The admin variables are `ADMIN_FIRSTNAME` / `ADMIN_LASTNAME` (no underscore between FIRST and NAME).

## Web (`apps/web`)

Copy `apps/web/.env.template` to `apps/web/.env`.

| Name | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, e.g. `https://api.example.com` or `http://localhost:8787` |
| `VITE_APP_TITLE` | App name used in the page title, meta tags and the PWA manifest (`Workbench`) |

## Testing from another device on the local network

With `ENVIRONMENT=development` in `apps/api/.dev.vars`, `bun run dev:native` serves the web app and the API on all interfaces, and the API accepts requests from `localhost` and private addresses (`10.x`, `172.16-31.x`, `192.168.x`, `*.local`). Set `VITE_API_URL` to the API on the same address you open the web app from, for example `http://192.168.1.105:8787` when browsing `http://192.168.1.105:5173`, so the refresh cookie stays same-site. Never use `ENVIRONMENT=development` on a deployed API.
