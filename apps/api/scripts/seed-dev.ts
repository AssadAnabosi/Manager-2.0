/**
 * Fills the LOCAL database with demo data for development: one user per role, workers with
 * worksheets, payees, cheques and bills. Everything is placed relative to the day it runs
 * (this month, last month, cheques due around today), so it never looks stale.
 *
 *   bun apps/api/scripts/seed-dev.ts            seed, or refresh when the data is from an earlier day
 *   bun apps/api/scripts/seed-dev.ts --force    replace the demo data now
 *
 * Only rows whose id starts with `dec0de00-` are ever touched; the administrator from
 * `db:seed:local` and anything a developer created by hand are left alone.
 * What it creates: docs/dev-data.md
 */
import { hashPassword } from "../src/services/password";
import { need, q, rowsOf, runSql, vars } from "./lib/d1";

if (process.argv.includes("--remote")) {
  console.error("Demo data is for local development only.");
  process.exit(1);
}
if (vars.ENVIRONMENT && vars.ENVIRONMENT !== "development") {
  console.error("Refusing to seed demo data: ENVIRONMENT is not development.");
  process.exit(1);
}

const DAY = 86_400_000;
const now = Date.now();
const today = Math.floor(now / DAY) * DAY; // UTC midnight, like the API stores dates
const dayAt = (offset: number) => today + offset * DAY;
const monthStart = (monthsBack: number) => {
  const d = new Date(today);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - monthsBack, 1);
};

/**
 * Demo rows get real UUIDs (the API rejects anything else as a worker or filter) that all
 * start with this marker, so a refresh can find exactly its own rows.
 */
const MARK = "dec0de00";
const KINDS = { user: "0001", log: "0002", payee: "0003", cheque: "0004", bill: "0005" };
const demoId = (kind: keyof typeof KINDS, n: number) =>
  `${MARK}-${KINDS[kind]}-4000-8000-${n.toString(16).padStart(12, "0")}`;
// rows of the first version of this script had readable ids; they are cleaned up too
const OURS = (col: string) => `(${col} LIKE '${MARK}-%' OR ${col} LIKE 'dev-%')`;

/** What every demo user logs in with (documented in docs/dev-data.md). */
const DEV_PASSWORD = "dev-password-123";

// Already seeded today? Then leave it, and whatever was edited since, alone.
const seeded = runSql(
  "--local",
  `SELECT MAX(created_at) AS at FROM users WHERE ${OURS("id")};`,
  ["--json"]
);
if (seeded.status !== 0) {
  console.error(seeded.stderr || seeded.stdout);
  process.exit(1);
}
const at = rowsOf(seeded.stdout)[0]?.at as number | null | undefined;
if (
  !process.argv.includes("--force") &&
  at &&
  Math.floor(at / DAY) * DAY === today
) {
  console.log("demo data is from today, skipping (use --force to replace it)");
  process.exit(0);
}

// A small deterministic generator: the same shape every run, only the dates move.
let state = 20240601;
const rand = () => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
const between = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

// ---- users ---------------------------------------------------------------------------

type Role = "Moderator" | "Spectator" | "User";
const users: {
  id?: string;
  first: string;
  last: string;
  username: string;
  role: Role;
  active?: boolean;
  language: "ar" | "en";
}[] = [
  { first: "Mona", last: "Khalil", username: "moderator", role: "Moderator", language: "en" },
  { first: "Sami", last: "Haddad", username: "spectator", role: "Spectator", language: "en" },
  { first: "Omar", last: "Nasser", username: "omar", role: "User", language: "en" },
  { first: "ليلى", last: "حداد", username: "layla", role: "User", language: "ar" },
  { first: "Yusuf", last: "Mansour", username: "yusuf", role: "User", language: "ar" },
  { first: "Nour", last: "Salem", username: "nour", role: "User", language: "en" },
  { first: "Ines", last: "Inactive", username: "inactive", role: "User", active: false, language: "en" },
];
// the workers whose days are filled in (the inactive one only has older history)
users.forEach((u, i) => (u.id = demoId("user", i + 1)));
const workers = users.filter((u) => u.role === "User");

const passwordEnv = {
  PASSWORD_PEPPER: need("PASSWORD_PEPPER"),
  PASSWORD_PEPPER_VERSION: need("PASSWORD_PEPPER_VERSION"),
  PBKDF2_ITERATIONS: need("PBKDF2_ITERATIONS"),
};

const sql: string[] = [
  // children first; only the demo rows
  `DELETE FROM logs WHERE ${OURS("id")} OR ${OURS("worker_id")};`,
  `DELETE FROM cheques WHERE ${OURS("id")};`,
  `DELETE FROM payees WHERE ${OURS("id")};`,
  `DELETE FROM bills WHERE ${OURS("id")};`,
  `DELETE FROM sessions WHERE ${OURS("user_id")};`,
  `DELETE FROM users WHERE ${OURS("id")};`,
];

for (const u of users) {
  const hash = await hashPassword(DEV_PASSWORD, passwordEnv);
  sql.push(
    `INSERT INTO users (id, first_name, last_name, username, email, phone_number, password_hash, role, active, theme, language, created_at, updated_at) VALUES (${q(u.id!)}, ${q(u.first)}, ${q(u.last)}, ${q(u.username)}, ${q(`${u.username}@example.com`)}, ${q("05" + String(between(10000000, 99999999)))}, ${q(hash)}, ${q(u.role)}, ${u.active === false ? 0 : 1}, 'system', ${q(u.language)}, ${now}, ${now});`
  );
}

// ---- worksheets: from the 1st of two months ago to today -----------------------------------

const REMARKS = [
  "Finished the delivery early",
  "Helped with the inventory count",
  "Covered the afternoon shift",
  "Machine maintenance in the morning",
  "Left early, doctor appointment",
  "Stayed late to finish the order",
];
const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
let logCount = 0;

for (const worker of workers) {
  const inactive = worker.active === false;
  for (let day = monthStart(2); day <= today; day += DAY) {
    const date = new Date(day);
    if (date.getUTCDay() === 5) continue; // Friday is the day off
    if (inactive && day > dayAt(-45)) continue;
    // Nour has no record for today, so there is a day to add by hand
    if (worker.username === "nour" && day === today) continue;
    // an occasional gap: a day nobody wrote down
    if (rand() < 0.04) continue;

    const absent = rand() < 0.07;
    let start = "00:00";
    let finish = "00:00";
    let otv = 0;
    if (!absent) {
      const from = between(14, 18) * 30; // 07:00 to 09:00
      const to = Math.min(
        from + between(16, 21) * 30 - (rand() < 0.2 ? 30 : 0), // 8 to 10.5 hours
        23 * 60 + 30
      );
      start = hhmm(from);
      finish = hhmm(to);
      otv = (to - from) / 60 - 8;
    }
    // paid on Thursdays (the last working day of the week), now and then an advance
    const payment =
      date.getUTCDay() === 4 ? between(60, 90) * 10 : rand() < 0.05 ? 100 : 0;
    const remarks = rand() < 0.15 ? pick(REMARKS) : null;
    sql.push(
      `INSERT INTO logs (id, worker_id, date, is_absent, starting_time, finishing_time, otv, payment, remarks, created_at, updated_at) VALUES (${q(demoId("log", logCount + 1))}, ${q(worker.id!)}, ${day}, ${absent ? 1 : 0}, ${q(start)}, ${q(finish)}, ${otv}, ${payment * 100}, ${q(remarks)}, ${now}, ${now});`
    );
    logCount++;
  }
}

// ---- payees and cheques ----------------------------------------------------------------

const payees = [
  ["Al-Noor Hardware", "orders@example.com", "Main supplier of fittings"],
  ["Galilee Paper Co.", "sales@example.com", null],
  ["Haddad Transport", null, "Pays by cheque only"],
  ["Safa Electric", "info@example.com", null],
  ["City Landlord", null, "Monthly rent"],
  ["Barakat Packaging", "barakat@example.com", "Ask for Barakat"],
] as const;
payees.forEach(([name, email, remarks], i) =>
  sql.push(
    `INSERT INTO payees (id, name, email, phone_number, remarks, created_at, updated_at) VALUES (${q(demoId("payee", i + 1))}, ${q(name)}, ${q(email)}, ${q("04" + String(between(1000000, 9999999)))}, ${q(remarks)}, ${now}, ${now});`
  )
);

// due dates around today: overdue, due today, this week, next month, far away
const cheques: [
  dueOffset: number,
  value: number,
  payee: number | null,
  cancelled?: boolean,
  remarks?: string,
][] = [
  [-55, 4200, 1], [-41, 1850, 2], [-33, 9600, 5, false, "Rent"], [-27, 730, 4],
  [-19, 2300, 3], [-12, 5100, 1], [-9, 640, null, true, "Cancelled, wrong amount"],
  [-4, 3150, 6], [-1, 1200, 2], [0, 2750, 4, false, "Due today"], [0, 880, null],
  [2, 6400, 1], [3, 1500, 3], [5, 3900, 6], [6, 2100, null], [9, 7800, 5, false, "Rent"],
  [13, 450, 2, true], [16, 5600, 4], [21, 3300, 1], [29, 9600, 5, false, "Rent"],
  [38, 1250, 3], [47, 4800, 6], [58, 2950, 2], [66, 8100, 1],
];
cheques.forEach(([offset, value, payee, cancelled, remarks], i) =>
  sql.push(
    `INSERT INTO cheques (id, serial, due_date, value, remarks, payee_id, is_cancelled, created_at, updated_at) VALUES (${q(demoId("cheque", i + 1))}, ${100100 + i * 7}, ${dayAt(offset)}, ${value * 100}, ${q(remarks)}, ${payee ? q(demoId("payee", payee)) : "NULL"}, ${cancelled ? 1 : 0}, ${now}, ${now});`
  )
);

// ---- bills: about two months of takings and spending -------------------------------------

type Item = readonly [description: string, min: number, max: number];
const EXPENSES: readonly Item[] = [
  ["Fuel for the van", 180, 420],
  ["Raw materials", 600, 3200],
  ["Electricity", 450, 900],
  ["Lunch for the workers", 120, 260],
  ["Spare parts", 90, 1400],
  ["Packaging", 200, 800],
  ["Cleaning supplies", 40, 150],
];
const INCOME: readonly Item[] = [
  ["Order paid in cash", 800, 4500],
  ["Customer payment", 1500, 9000],
  ["Walk-in sale", 60, 450],
];
let bills = 0;
for (let offset = -60; offset <= 0; offset++) {
  const count = between(0, 2);
  for (let i = 0; i < count; i++) {
    const income = rand() < 0.35;
    const [description, min, max] = pick(income ? INCOME : EXPENSES);
    const amount = between(min, max);
    sql.push(
      `INSERT INTO bills (id, date, type, amount, description, remarks, created_at, updated_at) VALUES (${q(demoId("bill", ++bills))}, ${dayAt(offset)}, ${q(income ? "income" : "expense")}, ${amount * 100}, ${q(description)}, ${q(rand() < 0.1 ? "Receipt kept" : null)}, ${now}, ${now});`
    );
  }
}

const run = runSql("--local", sql.join("\n") + "\n");
if (run.status !== 0) {
  console.error(run.stderr || run.stdout);
  process.exit(1);
}
console.log(
  `demo data seeded around ${new Date(today).toISOString().slice(0, 10)}: ${users.length} users, ${logCount} worksheet days, ${payees.length} payees, ${cheques.length} cheques, ${bills} bills`
);
console.log("Logins and contents: docs/dev-data.md");
