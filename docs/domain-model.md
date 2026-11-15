# Domain model

Every table has `id` (UUID v4, text), `created_at` and `updated_at` (epoch ms). Money is stored as integer minor units (agorot) and exposed as major units in JSON. `*` marks required fields.

## User

The **worker** who is allowed to access the app.

| Field | Notes |
| --- | --- |
| `firstName`*, `lastName`* | |
| `username`* | Unique, lowercased, `^[a-zA-Z0-9\-_.]+$` |
| `email`, `phoneNumber` | Optional; email is lowercased |
| `password`* | Stored as a salted, peppered PBKDF2 hash (see [auth.md](auth.md)) |
| `role` | `User` (default), `Spectator`, `Moderator`, `Administrator` |
| `active` | Whether the user may log in (default true) |
| `loggable` | Whether the user is offered as the worker of a new log (default true). Only an administrator can change it, from the Settings tab of the user page. See below |
| `theme` | Preferred theme (default `system`) |
| `language` | Preferred language (default `ar`) |

## Log

The worksheet / timesheet record of a worker's day.

| Field | Notes |
| --- | --- |
| `date`* | UTC midnight; unique together with `worker` |
| `worker`* | The user this log belongs to |
| `isAbsent` | True when the worker was absent |
| `startingTime`, `finishingTime` | Required together unless `isAbsent` |
| `otv` | Overtime amount (default 0) |
| `payment` | Money paid to the worker (default 0) |
| `remarks` | Optional notes |

There is no `description` field on a log.

### Loggable workers

To keep the worker lists short, a user with `loggable = false` is left out of them: the **Filter by worker** multi-select and the **Select a worker** box on Worksheets list only loggable users. Typing in those boxes still finds the others, so old logs of someone who stopped working are one search away. The **Worker** select of the new-worksheet form never offers them (a worker that is already chosen, such as the one of the log you are editing, stays). The flag does not touch the logs, the users page or what the API accepts: it only shapes the pickers.

## Payee

The person or company a cheque is made out to.

| Field | Notes |
| --- | --- |
| `name`* | Unique |
| `email`, `phoneNumber`, `remarks` | Optional |

## Cheque

| Field | Notes |
| --- | --- |
| `serial`* | The number written on the cheque; unique |
| `dueDate`* | Day the cheque is due |
| `value`* | Amount on the cheque |
| `payee` | Optional payee |
| `isCancelled` | True when cancelled |
| `remarks` | Optional notes |

## Bill

Money spent or received by the workshop.

| Field | Notes |
| --- | --- |
| `date`* | Day of the bill |
| `type`* | `expense` (shown as **Spent**) or `income` (shown as **Received**) |
| `amount`* | Always positive; the sign lives only in `type` |
| `description`* | |
| `remarks` | Optional notes |

## Session

One row per logged-in refresh token.

| Field | Notes |
| --- | --- |
| `user`* | Owner of the session |
| `refreshTokenHash`* | SHA-256 of the refresh token (the token itself is never stored) |
| `ipAddress`* | Client IP at login |
| `expiresAt`* | When the refresh token expires |

## Login attempt

Internal table used for rate limiting: `key` (`ip:<ip>` or `user:<username>`), `window_start`, `count`.

## Relations and delete behaviour

- Deleting a user deletes their logs and sessions (cascade).
- Deleting a payee sets `payee` to null on its cheques.
- Logging out (or an admin resetting a password) revokes the affected refresh tokens by deleting the sessions.
