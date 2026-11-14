# API

The routes, request and response schemas are generated from code:

- OpenAPI 3.1 document: `GET /openapi.json`
- Swagger UI: `GET /docs`

Both are public when enabled, but they are **disabled by default**: they are served only when `API_DOCS="true"` (set in local development, not in production). If `API_PREFIX` is set, every path (including these two) starts with it.

## Conventions

### Envelope

Success: `{ "success": true, "message"?: string, "data"?: object }`
Error: `{ "success": false, "message": string | string[] }`

Validation errors return 400 with the list of issue messages. Unique violations return 409. Unknown routes return 404. Oversized bodies (over 16 KB) return 413.

### IDs

Resources expose `id` (UUID), never `_id`. A malformed ID returns 400 ("Please provide a valid X"); a missing resource returns 404.

### Dates

Input is `YYYY-MM-DD` or a full ISO string. Day-only fields (`logs.date`, `bills.date`, `cheques.dueDate`) are normalized to UTC midnight. Output is ISO-8601, e.g. `2026-11-14T00:00:00.000Z`.

### Money

Numbers in major units (`120.5`) for `amount`, `value` and `payment`; numeric strings are accepted on input. Stored as integer agorot.

### List query parameters

| Param | Meaning |
| --- | --- |
| `from`, `to` | Date range; `from` is the start of that day and `to` the end of that day (UTC). If both are missing, the current month is used. (Not `start`/`end`.) |
| `search` | Trimmed, case-insensitive substring match on the resource's text fields |
| `filter` | Comma-separated IDs; each must be a valid UUID, otherwise 400 "Please provide a valid filter" |
| `serial` | Cheques only |
| `type` | Bills only: `expense` or `income`; default both |
| `active` | Users only |

### Bills totals

`GET /bills` returns `totals.range` (same filters as the list) and `totals.allTime` (no filters), each with `spent`, `received` and `net` (`net = spent - received`).

### Logs

Responses use `OTV` (overtime hours) as the field name. A log is either an absence (`isAbsent: true`; any times sent are ignored and stored as `00:00`) or a worked day (`isAbsent: false` with both `startingTime` and `finishingTime`, `HH:MM`). Overtime is the worked time minus 8 hours and may be negative. `date` and `worker` can't be changed after creation. A user with the `User` role only sees their own logs.

### Cheques

`serial` is a comma-separated list; when given, only those serials are returned and the date range and `filter` are ignored. `total` excludes cancelled cheques. A cheque whose payee was deleted shows `payee: { id: null, name: "Deleted Payee" }`.

### Guards and ID parameters

Role guards run before an `:xxxID` parameter is validated, so a caller without the required role gets 403 whether or not the ID exists. After that, a malformed ID returns 400 and an unknown ID returns 404.

### Other endpoints

`GET /` returns the version and environment; `GET /health` returns 200.
