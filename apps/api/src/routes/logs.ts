import { createRoute, z } from "@hono/zod-openapi";
import { and, desc, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import {
  ADMIN,
  MODERATOR,
  USER,
  createLogSchema,
  logGetSchema,
  logsListSchema,
  logsQuerySchema,
  updateLogSchema,
} from "@workbench/shared";
import { getDb, type DB } from "../db";
import { logs, users } from "../db/schema";
import { startOfUtcDay } from "../lib/dates";
import {
  CREATED,
  NOT_AUTHORIZED,
  NOT_FOUND,
  NO_CONTENT,
  OK,
  ResponseError,
} from "../lib/http";
import { isUuid } from "../lib/ids";
import { toMajor, toMinor } from "../lib/money";
import { nullIfEmpty, parseListQuery } from "../lib/query";
import { authorize } from "../middleware/auth";
import { paramRecord } from "../middleware/params";
import {
  bearer,
  createRouter,
  errorResponse,
  jsonResponse,
  protectedErrors,
} from "./router";

const ABSENT_TIME = "00:00";

/** Overtime in hours: worked time minus an 8 hour day (may be negative). */
export const computeOtv = (start: string, finish: string): number => {
  const [sh, sm] = start.split(":").map(Number);
  const [fh, fm] = finish.split(":").map(Number);
  return fh - sh + (fm - sm) / 60 - 8;
};

type LogJoin = {
  log: typeof logs.$inferSelect;
  worker: typeof users.$inferSelect;
};

export const serializeLog = ({ log, worker }: LogJoin) => ({
  id: log.id,
  date: log.date.toISOString(),
  isAbsent: log.isAbsent,
  startingTime: log.startingTime ?? ABSENT_TIME,
  finishingTime: log.finishingTime ?? ABSENT_TIME,
  OTV: log.otv,
  payment: toMajor(log.payment),
  ...(log.remarks ? { remarks: log.remarks } : {}),
  worker: { id: worker.id, fullName: `${worker.firstName} ${worker.lastName}` },
});

const selectLogs = (db: DB, where?: SQL) =>
  db
    .select({ log: logs, worker: users })
    .from(logs)
    .innerJoin(users, eq(logs.workerId, users.id))
    .where(where)
    .orderBy(desc(logs.date));

const params = z.object({ logID: z.string() });
const mount = authorize();
const write = authorize([MODERATOR, ADMIN]);
const load = paramRecord("logID", logs);
const badId = {
  400: errorResponse("Validation error or malformed ID"),
  404: errorResponse("Log not found"),
};

export const logsRoutes = () => {
  const list = createRoute({
    method: "get",
    path: "/logs",
    tags: ["Logs"],
    summary: "List logs",
    description:
      "Users only see their own logs. `filter` (comma-separated worker IDs) applies to other roles. Sums cover exactly the listed logs.",
    security: bearer,
    middleware: [mount],
    request: { query: logsQuerySchema },
    responses: {
      200: jsonResponse("Logs and sums", logsListSchema),
      400: errorResponse("Invalid query"),
      ...protectedErrors,
    },
  });
  const create = createRoute({
    method: "post",
    path: "/logs",
    tags: ["Logs"],
    summary: "Create a log",
    description:
      "Either `isAbsent: true`, or `isAbsent: false` with both `startingTime` and `finishingTime` (HH:MM).",
    security: bearer,
    middleware: [mount, write],
    request: {
      body: { content: { "application/json": { schema: createLogSchema } } },
    },
    responses: {
      201: { description: "Created" },
      400: errorResponse("Validation error"),
      404: errorResponse("Worker not found"),
      409: errorResponse("A log for this worker and date exists"),
      ...protectedErrors,
    },
  });
  const get = createRoute({
    method: "get",
    path: "/logs/{logID}",
    tags: ["Logs"],
    summary: "Get a log",
    security: bearer,
    middleware: [mount, load],
    request: { params },
    responses: {
      200: jsonResponse("The log", logGetSchema),
      ...badId,
      ...protectedErrors,
    },
  });
  const update = createRoute({
    method: "put",
    path: "/logs/{logID}",
    tags: ["Logs"],
    summary: "Update a log (worker and date can't change)",
    security: bearer,
    middleware: [mount, write, load],
    request: {
      params,
      body: { content: { "application/json": { schema: updateLogSchema } } },
    },
    responses: {
      204: { description: "Updated" },
      ...badId,
      ...protectedErrors,
    },
  });
  const remove = createRoute({
    method: "delete",
    path: "/logs/{logID}",
    tags: ["Logs"],
    summary: "Delete a log",
    security: bearer,
    middleware: [mount, write, load],
    request: { params },
    responses: {
      204: { description: "Deleted" },
      ...badId,
      ...protectedErrors,
    },
  });

  return createRouter()
    .openapi(list, async (c) => {
      const me = c.get("user");
      const { startDate, endDate, filter, from, to } = parseListQuery(
        c.req.valid("query")
      );
      const conditions: SQL[] = [];
      if (me.role === USER) conditions.push(eq(logs.workerId, me.id));
      if (startDate) conditions.push(gte(logs.date, startDate));
      if (endDate) conditions.push(lte(logs.date, endDate));
      if (me.role !== USER && filter && filter.length) {
        conditions.push(inArray(logs.workerId, filter));
      }
      const rows = await selectLogs(
        getDb(c.env.DB),
        conditions.length ? and(...conditions) : undefined
      );

      let paymentsMinor = 0;
      let daysCount = 0;
      let otvSum = 0;
      for (const { log } of rows) {
        paymentsMinor += log.payment;
        if (!log.isAbsent) {
          daysCount += 1;
          otvSum += log.otv;
        }
      }
      return c.json(
        {
          success: true as const,
          data: {
            logs: rows.map(serializeLog),
            paymentsSumValue: toMajor(paymentsMinor),
            daysCount,
            OTVSum: otvSum,
            from,
            to,
            filter: filter ?? "",
          },
        },
        OK
      );
    })
    .openapi(create, async (c) => {
      const body = c.req.valid("json");
      const db = getDb(c.env.DB);
      const [worker] = isUuid(body.worker)
        ? await db.select().from(users).where(eq(users.id, body.worker)).limit(1)
        : [];
      if (!worker) throw new ResponseError("WORKER_NOT_FOUND", NOT_FOUND);

      const absent = body.isAbsent;
      await db.insert(logs).values({
        workerId: worker.id,
        date: startOfUtcDay(body.date),
        isAbsent: absent,
        startingTime: absent ? ABSENT_TIME : body.startingTime!,
        finishingTime: absent ? ABSENT_TIME : body.finishingTime!,
        otv: absent ? 0 : computeOtv(body.startingTime!, body.finishingTime!),
        payment: toMinor(body.payment ?? 0),
        remarks: nullIfEmpty(body.remarks),
      });
      return c.body(null, CREATED);
    })
    .openapi(get, async (c) => {
      const me = c.get("user");
      const record = c.get("record") as typeof logs.$inferSelect;
      if (me.role === USER && record.workerId !== me.id) {
        throw new ResponseError("LOG_FORBIDDEN", NOT_AUTHORIZED);
      }
      const [row] = await selectLogs(getDb(c.env.DB), eq(logs.id, record.id));
      return c.json(
        { success: true as const, data: { log: serializeLog(row) } },
        OK
      );
    })
    .openapi(update, async (c) => {
      const body = c.req.valid("json");
      const set: Partial<typeof logs.$inferInsert> = {};
      if (body.isAbsent === true) {
        set.isAbsent = true;
        set.startingTime = ABSENT_TIME;
        set.finishingTime = ABSENT_TIME;
        set.otv = 0;
      } else {
        set.isAbsent = false;
        set.startingTime = body.startingTime!;
        set.finishingTime = body.finishingTime!;
        set.otv = computeOtv(body.startingTime!, body.finishingTime!);
      }
      if (body.payment !== undefined) set.payment = toMinor(body.payment);
      if (body.remarks !== undefined) set.remarks = nullIfEmpty(body.remarks);
      await getDb(c.env.DB)
        .update(logs)
        .set(set)
        .where(eq(logs.id, c.get("record").id));
      return c.body(null, NO_CONTENT);
    })
    .openapi(remove, async (c) => {
      await getDb(c.env.DB).delete(logs).where(eq(logs.id, c.get("record").id));
      return c.body(null, NO_CONTENT);
    });
};
