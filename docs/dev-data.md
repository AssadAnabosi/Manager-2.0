# Demo data for development

A fresh local database comes with demo data, so every screen has something in it. It is **for local development only**: the script refuses to run against a remote database or when `ENVIRONMENT` is not `development`.

## Getting it

| How you run the app | What happens |
| --- | --- |
| `bun run dev` (Docker) | The `migrate` service seeds the admin and the demo data on every start |
| Native | `bun run db:migrate:local && bun run db:seed:local && bun run db:seed:dev` |
| `bun run db:reset:local` | Wipes the local database and seeds everything again |

`bun run db:seed:dev` on its own:

- seeds when there is no demo data yet, or replaces it when it was seeded on an earlier day;
- does nothing when the data is already from today, so your edits survive restarts within the day;
- `bun run db:seed:dev -- --force` replaces the demo data right now.

Only rows whose id starts with `dec0de00-` are touched (they are real UUIDs, because the API rejects any other id). The administrator and anything you created by hand stay as they are (but note that replacing the demo data deletes the demo users' worksheets, and with them any edits you made to those).

## Dates are relative to the day it ran

Nothing is hard-coded to a year or a month. Dates are computed from the current UTC day, so the data always looks current:

| Data | Where it lands |
| --- | --- |
| Worksheets | From the 1st of the month before last, up to and including today, every day except Friday (the day off) |
| Bills | Every day of the last 60 days, up to today |
| Cheques | From 55 days ago to 66 days ahead: some overdue, two due today, several this week, the rest in the next two months |

So on 3 January it fills November, December and the first days of January; on 15 November it fills September, October and the first half of November. The generator is deterministic, so the shape of the data is the same on every run; only the dates move.

## Logins

| Username | Role | Language | Password |
| --- | --- | --- | --- |
| `admin` | Administrator | Arabic | `ADMIN_PASSWORD` in your `.dev.vars` (`change-me-please-123` in `.dev.vars.example`) |
| `moderator` | Moderator | English | `dev-password-123` |
| `spectator` | Spectator | English | `dev-password-123` |
| `omar` | User (worker) | English | `dev-password-123` |
| `layla` | User (worker) | Arabic | `dev-password-123` |
| `yusuf` | User (worker) | Arabic | `dev-password-123` |
| `nour` | User (worker) | English | `dev-password-123` |
| `karim` | User, not loggable | English | `dev-password-123` |
| `inactive` | User, deactivated | English | `dev-password-123` (login is refused) |

These are development credentials, published on purpose. Never use them anywhere else. What each role can do is in [roles-and-rules.md](roles-and-rules.md).

## What is in it

**Users.** The eight above plus the administrator. Emails are `<username>@example.com`.

**Worksheets.** Omar, Layla, Yusuf and Nour each have a record for most working days: start between 07:00 and 09:00, 8 to 10.5 hours long (so the overtime figures vary), about 7% absences, a handful of remarks, a payment on Thursdays and the occasional advance. There are also a few days with no record at all. Specifics worth knowing:

- Nour has **no record for today**, so there is always a day to add by hand (and an empty day in the calendar).
- The inactive user and Karim only have older history (nothing in the last 45 days). Karim is **not loggable**: he is missing from the worker lists until you type his name, and never appears in the new-worksheet worker select.
- The moderator and the spectator have no worksheets, so they are not in the worker lists.

**Payees.** Six suppliers (Al-Noor Hardware, Galilee Paper Co., Haddad Transport, Safa Electric, City Landlord, Barakat Packaging). Some have an email, some a remark, all have a phone number.

**Cheques.** 24 cheques with serials from 100100 in steps of 7. Two are cancelled (one overdue, one upcoming), three have no payee, and three are the rent to City Landlord.

**Bills.** About 75 spent and received bills (roughly one in three is received) with amounts from a few dozen to a few thousand.

## Adding to it

The seeder is [`apps/api/scripts/seed-dev.ts`](../apps/api/scripts/seed-dev.ts) and shares its helpers with the admin seeder in `apps/api/scripts/lib/d1.ts`. Give new rows an id from `demoId(...)` so a refresh can clean them up, and place dates with `dayAt(offset)` (days from today) or `monthStart(monthsBack)`, never as literal dates.
