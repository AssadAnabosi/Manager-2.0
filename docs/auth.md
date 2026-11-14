# Authentication

## Tokens

- **Access token**: HS256 JWT signed with `JWT_ACCESS_SECRET`, payload `{ id, sessionId }`, issuer `JWT_ISSUER`, lifetime `JWT_ACCESS_EXPIRE` (default `15m`). Sent as `Authorization: Bearer <token>` on every request.
- **Refresh token**: HS256 JWT signed with `JWT_REFRESH_SECRET`, payload `{ id }` plus a random `jti` so each token is unique. Lifetime `REFRESH_MAX_AGE` (default `30d`). Used only to obtain new access tokens.

## Refresh cookie

`refreshToken`; host-only (no `Domain`); `HttpOnly; Secure; SameSite=Strict; Path=<API_PREFIX>/auth; Max-Age=<REFRESH_MAX_AGE>`.

`api.example.com` and `dash.example.com` are the same site but different origins, so the browser sends the cookie on cross-origin XHR with `withCredentials: true`, and CORS allows only the exact origins in `ALLOWED_ORIGINS`. `localhost:5173` to `localhost:8787` also counts as same-site, so the cookie works in development.

## Sessions

Only `SHA-256(refreshToken)` (hex) is stored in `sessions.refresh_token_hash`; sessions are looked up by that hash. The refresh token is not rotated on refresh.

- **Login** deletes the session of an incoming refresh cookie (if any), creates a new session and sets the cookie.
- **Refresh** issues a new access token.
- **Logout** deletes the session and clears the cookie.
- A daily cron deletes expired sessions.

## Password hashing

Workers' free plan allows about 10 ms CPU per request, and PBKDF2-SHA256 at 100k iterations costs about 23 ms there. So hashing uses the highest iteration count that fits, strengthened with a server-side pepper.

1. Normalize: `pw = password.normalize("NFKC")`.
2. Pepper: `p = HMAC-SHA256(key = base64decode(PASSWORD_PEPPER), message = UTF-8(pw))`.
3. Hash: `PBKDF2-SHA256(p, salt = 16 random bytes, iterations = N, 256 bits)`.
4. Stored format: `pbkdf2-sha256$<pepperVersion>$<N>$<salt b64url>$<hash b64url>`.
5. Verify recomputes with the stored N, salt and pepper version, compares in constant time, and re-hashes the row when N or the pepper version is out of date.

`N` is the `PBKDF2_ITERATIONS` variable (Workers caps PBKDF2 at 100,000). It starts at `30000` and is tuned from a benchmark on the deployed Worker; the chosen value and its measured CPU time are recorded here once measured.

Password rules: at least 12 characters, no maximum (only the 16 KB body limit applies).

## Login safety

- Rate limits are checked before any hashing: 20 failed attempts per IP and 5 per username per 15-minute window; over the limit returns 429.
- Exactly one password verification runs per login: against the user's hash, or against a constant dummy hash when the user doesn't exist, so timing does not reveal which usernames exist.
- `active` is checked only after the password matches.
- A successful login clears the username counter.
- A Cloudflare WAF rule (POST `/auth`, per IP) adds an edge layer; the code doesn't depend on it.
