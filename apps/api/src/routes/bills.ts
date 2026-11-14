import { createRoute, z } from "@hono/zod-openapi";
import { and, desc, eq, gte, lte, or, sql, type SQL } from "drizzle-orm";
import {
  ADMIN,
  BILL_TYPES,
  MODERATOR,
  USER,
  billGetSchema,
  billsListSchema,
  billsQuerySchema,
  createBillSchema,
  messageSuccessSchema,
  updateBillSchema,
} from "@workbench/shared";
import { getDb, type DB } from "../db";
import { bills, type BillRow } from "../db/schema";
import { startOfUtcDay } from "../lib/dates";
import { BAD_REQUEST, CREATED, OK, ResponseError } from "../lib/http";
import { toMajor, toMinor } from "../lib/money";
import { containsLike, nullIfEmpty, parseListQuery } from "../lib/query";
import { authorize, notAuthorized } from "../middleware/auth";
import { paramRecord } from "../middleware/params";
import {
  bearer,
  createRouter,
  errorResponse,
  jsonResponse,
  protectedErrors,
} from "./router";

export const serializeBill = (b: BillRow) => ({
  id: b.id,
  date: b.date.toISOString(),
  type: b.type,
  amount: toMajor(b.amount),
  description: b.description,
  ...(b.remarks ? { remarks: b.remarks } : {}),
});

/** Spent / received / net in major units for the rows matching `where` (all rows if omitted). */
const totalsFor = async (db: DB, where?: SQL) => {
  const [row] = await db
    .select({
      spent: sql<number>`COALESCE(SUM(CASE WHEN ${bills.type} = 'expense' THEN ${bills.amount} END), 0)`,
      received: sql<number>`COALESCE(SUM(CASE WHEN ${bills.type} = 'income' THEN ${bills.amount} END), 0)`,
    })
    .from(bills)
    .where(where);
  return {
    spent: toMajor(row.spent),
    received: toMajor(row.received),
    net: toMajor(row.spent - row.received),
  };
};

const params = z.object({ billID: z.string() });
const mount = notAuthorized([USER]);
const write = authorize([MODERATOR, ADMIN]);
const load = paramRecord("billID", bills);
const badId = {
  400: errorResponse("Validation error or malformed ID"),
  404: errorResponse("Bill not found"),
};

export const billsRoutes = () => {
  const list = createRoute({
    method: "get",
    path: "/bills",
    tags: ["Bills"],
    summary: "List bills with range and all-time totals",
    description:
      "`type` (expense or income) is optional; the default is both. Range totals use the same filters as the list; all-time totals ignore every filter.",
    security: bearer,
    middleware: [mount],
    request: { query: billsQuerySchema },
    responses: {
      200: jsonResponse("Bills and totals", billsListSchema),
      400: errorResponse("Invalid query"),
      ...protectedErrors,
    },
  });
  const create = createRoute({
    method: "post",
    path: "/bills",
    tags: ["Bills"],
    summary: "Create a bill",
    security: bearer,
    middleware: [mount, write],
    request: {
      body: { content: { "application/json": { schema: createBillSchema } } },
    },
    responses: {
      201: jsonResponse("Created", messageSuccessSchema),
      400: errorResponse("Validation error"),
      ...protectedErrors,
    },
  });
  const get = createRoute({
    method: "get",
    path: "/bills/{billID}",
    tags: ["Bills"],
    summary: "Get a bill",
    security: bearer,
    middleware: [mount, load],
    request: { params },
    responses: {
      200: jsonResponse("The bill", billGetSchema),
      ...badId,
      ...protectedErrors,
    },
  });
  const update = createRoute({
    method: "put",
    path: "/bills/{billID}",
    tags: ["Bills"],
    summary: "Update a bill",
    security: bearer,
    middleware: [mount, write, load],
    request: {
      params,
      body: { content: { "application/json": { schema: updateBillSchema } } },
    },
    responses: {
      200: jsonResponse("Updated", messageSuccessSchema),
      ...badId,
      ...protectedErrors,
    },
  });
  const remove = createRoute({
    method: "delete",
    path: "/bills/{billID}",
    tags: ["Bills"],
    summary: "Delete a bill",
    security: bearer,
    middleware: [mount, write, load],
    request: { params },
    responses: {
      200: jsonResponse("Deleted", messageSuccessSchema),
      ...badId,
      ...protectedErrors,
    },
  });

  return createRouter()
    .openapi(list, async (c) => {
      const query = c.req.valid("query");
      const { startDate, endDate, search, from, to } = parseListQuery(query);
      if (
        query.type !== undefined &&
        !(BILL_TYPES as readonly string[]).includes(query.type)
      ) {
        throw new ResponseError(
          `Invalid bill type [${BILL_TYPES.toString()}]`,
          BAD_REQUEST
        );
      }
      const conditions: SQL[] = [];
      if (startDate) conditions.push(gte(bills.date, startDate));
      if (endDate) conditions.push(lte(bills.date, endDate));
      if (search) {
        conditions.push(
          or(
            containsLike(bills.description, search),
            containsLike(bills.remarks, search)
          )!
        );
      }
      if (query.type) {
        conditions.push(eq(bills.type, query.type as (typeof BILL_TYPES)[number]));
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const db = getDb(c.env.DB);
      const rows = await db.select().from(bills).where(where).orderBy(desc(bills.date));
      const [range, allTime] = await Promise.all([
        totalsFor(db, where),
        totalsFor(db),
      ]);
      return c.json(
        {
          success: true as const,
          data: {
            bills: rows.map(serializeBill),
            totals: { range, allTime },
            from,
            to,
            search,
          },
        },
        OK
      );
    })
    .openapi(create, async (c) => {
      const body = c.req.valid("json");
      await getDb(c.env.DB)
        .insert(bills)
        .values({
          date: startOfUtcDay(body.date),
          type: body.type,
          amount: toMinor(body.amount),
          description: body.description,
          remarks: nullIfEmpty(body.remarks),
        });
      return c.json(
        { success: true as const, message: "Bill was added successfully" },
        CREATED
      );
    })
    .openapi(get, (c) =>
      c.json(
        { success: true as const, data: { bill: serializeBill(c.get("record")) } },
        OK
      )
    )
    .openapi(update, async (c) => {
      const body = c.req.valid("json");
      const set: Partial<typeof bills.$inferInsert> = {};
      if (body.date !== undefined) set.date = startOfUtcDay(body.date);
      if (body.type !== undefined) set.type = body.type;
      if (body.amount !== undefined) set.amount = toMinor(body.amount);
      if (body.description !== undefined) set.description = body.description;
      if (body.remarks !== undefined) set.remarks = nullIfEmpty(body.remarks);
      if (Object.keys(set).length) {
        await getDb(c.env.DB)
          .update(bills)
          .set(set)
          .where(eq(bills.id, c.get("record").id));
      }
      return c.json(
        { success: true as const, message: "Bill was updated successfully" },
        OK
      );
    })
    .openapi(remove, async (c) => {
      await getDb(c.env.DB).delete(bills).where(eq(bills.id, c.get("record").id));
      return c.json(
        { success: true as const, message: "Bill was deleted successfully" },
        OK
      );
    });
};
