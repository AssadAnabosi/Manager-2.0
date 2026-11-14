# Architecture

```
 browser / PWA ──► dash.example.com   (Cloudflare Pages, static SPA)
       │  axios, withCredentials: true   (cross-origin but same site: both under example.com)
       ▼
 api.example.com ── Cloudflare Worker "workbench-api" (Custom Domain; workers.dev disabled)
                      ├─ Hono + @hono/zod-openapi
                      ├─ CORS: exact allow-list (dash.example.com)
                      ├─ /openapi.json + /docs (Swagger UI, development only)
                      ├─ login rate limiting in D1 (+ one WAF rule at the edge)
                      ├─ D1 "workbench-db" via Drizzle
                      └─ scheduled(): daily cleanup (expired sessions, old login attempts)
```

## Repository layout

| Path | Package | Purpose |
| --- | --- | --- |
| `apps/web` | `@workbench/web` | React + Vite PWA, deployed by Cloudflare Pages |
| `apps/api` | `@workbench/api` | Cloudflare Worker (Hono, D1, Drizzle) |
| `packages/shared` | `@workbench/shared` | Zod schemas and inferred types used by both apps |

## Request flow

1. The SPA calls `https://api.example.com` with `withCredentials: true`.
2. The Worker applies CORS (exact origin allow-list), the 16 KB body limit and routing.
3. Protected routes verify the access token (`Authorization: Bearer`), then load the session and user from D1 and check `active` and the role (see [roles-and-rules.md](roles-and-rules.md)).
4. Request bodies, params and queries are validated by Zod schemas from `@workbench/shared`; the same schemas generate the OpenAPI document.
5. Services talk to D1 through Drizzle. Errors are mapped to the response envelope described in [api.md](api.md).

The refresh cookie is host-only on `api.example.com`, `SameSite=Strict`, so it is sent only to the API from the same site.

## Why Workers + D1

The whole stack (static SPA, API, database, cron) runs on Cloudflare's free plan with no server to manage, and the front-end and API share a registrable domain so the `SameSite=Strict` refresh cookie works. CPU time is the main constraint, which shapes password hashing (see [auth.md](auth.md)).

## Free-plan budget

| Piece | Limit | Notes |
| --- | --- | --- |
| Workers | 100,000 requests/day, 10 ms CPU per request | Login is the only heavy route |
| D1 | 5 M rows read, 100 k rows written per day, 500 MB | The dataset grows by a few thousand rows a year |
| Cron Triggers | included | The cleanup is two cheap `DELETE`s |
| Pages | static requests are free | No Pages Functions |
