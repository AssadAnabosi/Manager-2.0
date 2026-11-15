import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
};

export const users = sqliteTable(
  "users",
  {
    id: id(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    username: text("username").notNull(),
    email: text("email"),
    phoneNumber: text("phone_number"),
    passwordHash: text("password_hash").notNull(),
    role: text("role", {
      enum: ["User", "Spectator", "Moderator", "Administrator"],
    })
      .notNull()
      .default("User"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    /** Whether the user is offered when picking a worker for a new log. */
    loggable: integer("loggable", { mode: "boolean" }).notNull().default(true),
    theme: text("theme").notNull().default("system"),
    language: text("language").notNull().default("ar"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("users_username_unique").on(t.username),
    check(
      "users_role_check",
      sql`${t.role} IN ('User', 'Spectator', 'Moderator', 'Administrator')`
    ),
  ]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    ipAddress: text("ip_address").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("sessions_refresh_token_hash_unique").on(t.refreshTokenHash),
    index("sessions_expires_at_idx").on(t.expiresAt),
    index("sessions_user_id_idx").on(t.userId),
  ]
);

export const logs = sqliteTable(
  "logs",
  {
    id: id(),
    workerId: text("worker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    isAbsent: integer("is_absent", { mode: "boolean" })
      .notNull()
      .default(false),
    startingTime: text("starting_time"),
    finishingTime: text("finishing_time"),
    otv: real("otv").notNull().default(0),
    payment: integer("payment").notNull().default(0),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("logs_date_worker_id_unique").on(t.date, t.workerId),
    index("logs_worker_id_idx").on(t.workerId),
  ]
);

export const payees = sqliteTable(
  "payees",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email"),
    phoneNumber: text("phone_number"),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => [uniqueIndex("payees_name_unique").on(t.name)]
);

export const cheques = sqliteTable(
  "cheques",
  {
    id: id(),
    serial: integer("serial").notNull(),
    dueDate: integer("due_date", { mode: "timestamp_ms" }).notNull(),
    value: integer("value").notNull(),
    remarks: text("remarks"),
    payeeId: text("payee_id").references(() => payees.id, {
      onDelete: "set null",
    }),
    isCancelled: integer("is_cancelled", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("cheques_serial_unique").on(t.serial),
    index("cheques_due_date_serial_idx").on(t.dueDate, t.serial),
    index("cheques_payee_id_idx").on(t.payeeId),
  ]
);

export const bills = sqliteTable(
  "bills",
  {
    id: id(),
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    type: text("type", { enum: ["expense", "income"] }).notNull(),
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => [
    index("bills_date_idx").on(t.date),
    index("bills_type_date_idx").on(t.type, t.date),
    check("bills_type_check", sql`${t.type} IN ('expense', 'income')`),
    check("bills_amount_check", sql`${t.amount} > 0`),
  ]
);

export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    key: text("key").notNull(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })]
);

export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type PayeeRow = typeof payees.$inferSelect;
export type ChequeRow = typeof cheques.$inferSelect;
export type BillRow = typeof bills.$inferSelect;
export type LogRow = typeof logs.$inferSelect;
