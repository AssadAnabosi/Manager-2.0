import { createRoute, z } from "@hono/zod-openapi";
import { and, asc, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import {
  ADMIN,
  MODERATOR,
  USER,
  chequeGetSchema,
  chequesListSchema,
  chequesQuerySchema,
  createChequeSchema,
  updateChequeSchema,
} from "@workbench/shared";
import { getDb, type DB } from "../db";
import { cheques, payees } from "../db/schema";
import { startOfUtcDay } from "../lib/dates";
import { CREATED, NOT_FOUND, NO_CONTENT, OK, ResponseError } from "../lib/http";
import { toMajor, toMinor } from "../lib/money";
import { nullIfEmpty, parseListQuery } from "../lib/query";
import { authorize, notAuthorized } from "../middleware/auth";
import { paramRecord } from "../middleware/params";
import {
  bearer,
  createRouter,
  errorResponse,
  jsonResponse,
  protectedErrors,
} from "./router";

type ChequeJoin = {
  cheque: typeof cheques.$inferSelect;
  payee: typeof payees.$inferSelect | null;
};

export const serializeCheque = ({ cheque, payee }: ChequeJoin) => ({
  id: cheque.id,
  serial: cheque.serial,
  dueDate: cheque.dueDate.toISOString(),
  value: toMajor(cheque.value),
  ...(cheque.remarks ? { remarks: cheque.remarks } : {}),
  payee: {
    id: payee?.id ?? null,
    name: payee?.name ?? "Deleted Payee",
  },
  isCancelled: cheque.isCancelled,
});

const selectCheques = (db: DB, where?: SQL) =>
  db
    .select({ cheque: cheques, payee: payees })
    .from(cheques)
    .leftJoin(payees, eq(cheques.payeeId, payees.id))
    .where(where)
    .orderBy(asc(cheques.dueDate), asc(cheques.serial));

const requirePayee = async (db: DB, id: string) => {
  const [payee] = await db.select().from(payees).where(eq(payees.id, id)).limit(1);
  if (!payee) throw new ResponseError("Payee not found", NOT_FOUND);
  return payee;
};

const params = z.object({ chequeID: z.string() });
const mount = notAuthorized([USER]);
const write = authorize([MODERATOR, ADMIN]);
const load = paramRecord("chequeID", cheques);
const badId = {
  400: errorResponse("Validation error or malformed ID"),
  404: errorResponse("Cheque not found"),
};

export const chequesRoutes = () => {
  const list = createRoute({
    method: "get",
    path: "/cheques",
    tags: ["Cheques"],
    summary: "List cheques",
    description:
      "`serial` is a comma-separated list; when given, only those serials are returned and the date range and payee filter are ignored. `total` excludes cancelled cheques.",
    security: bearer,
    middleware: [mount],
    request: { query: chequesQuerySchema },
    responses: {
      200: jsonResponse("Cheques", chequesListSchema),
      400: errorResponse("Invalid query"),
      ...protectedErrors,
    },
  });
  const create = createRoute({
    method: "post",
    path: "/cheques",
    tags: ["Cheques"],
    summary: "Create a cheque",
    security: bearer,
    middleware: [mount, write],
    request: {
      body: { content: { "application/json": { schema: createChequeSchema } } },
    },
    responses: {
      201: { description: "Created" },
      400: errorResponse("Validation error"),
      404: errorResponse("Payee not found"),
      409: errorResponse("Serial already exists"),
      ...protectedErrors,
    },
  });
  const get = createRoute({
    method: "get",
    path: "/cheques/{chequeID}",
    tags: ["Cheques"],
    summary: "Get a cheque",
    security: bearer,
    middleware: [mount, load],
    request: { params },
    responses: {
      200: jsonResponse("The cheque", chequeGetSchema),
      ...badId,
      ...protectedErrors,
    },
  });
  const update = createRoute({
    method: "put",
    path: "/cheques/{chequeID}",
    tags: ["Cheques"],
    summary: "Update a cheque",
    security: bearer,
    middleware: [mount, write, load],
    request: {
      params,
      body: { content: { "application/json": { schema: updateChequeSchema } } },
    },
    responses: {
      204: { description: "Updated" },
      409: errorResponse("Serial already exists"),
      ...badId,
      ...protectedErrors,
    },
  });
  const remove = createRoute({
    method: "delete",
    path: "/cheques/{chequeID}",
    tags: ["Cheques"],
    summary: "Delete a cheque",
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
      const query = c.req.valid("query");
      const { startDate, endDate, filter, serial, from, to } =
        parseListQuery(query);

      const conditions: SQL[] = [];
      if (serial) {
        const serials = serial
          .replace(/\s/g, "")
          .split(",")
          .map((s) => parseInt(s, 10) | 0);
        conditions.push(inArray(cheques.serial, serials));
      } else {
        if (startDate) conditions.push(gte(cheques.dueDate, startDate));
        if (endDate) conditions.push(lte(cheques.dueDate, endDate));
        if (filter && filter.length) {
          conditions.push(inArray(cheques.payeeId, filter));
        }
      }
      const rows = await selectCheques(
        getDb(c.env.DB),
        conditions.length ? and(...conditions) : undefined
      );
      const totalMinor = rows
        .filter((r) => !r.cheque.isCancelled)
        .reduce((sum, r) => sum + r.cheque.value, 0);
      return c.json(
        {
          success: true as const,
          data: {
            cheques: rows.map(serializeCheque),
            number: rows.length,
            total: toMajor(totalMinor),
            from,
            to,
            serial,
            filter: filter ?? "",
          },
        },
        OK
      );
    })
    .openapi(create, async (c) => {
      const body = c.req.valid("json");
      const db = getDb(c.env.DB);
      const payee = body.payee ? await requirePayee(db, body.payee) : null;
      await db.insert(cheques).values({
        serial: body.serial,
        dueDate: startOfUtcDay(body.dueDate),
        value: toMinor(body.value),
        remarks: nullIfEmpty(body.remarks),
        payeeId: payee?.id ?? null,
        isCancelled: body.isCancelled,
      });
      return c.body(null, CREATED);
    })
    .openapi(get, async (c) => {
      const [row] = await selectCheques(
        getDb(c.env.DB),
        eq(cheques.id, c.get("record").id)
      );
      return c.json(
        { success: true as const, data: { cheque: serializeCheque(row) } },
        OK
      );
    })
    .openapi(update, async (c) => {
      const body = c.req.valid("json");
      const db = getDb(c.env.DB);
      const set: Partial<typeof cheques.$inferInsert> = {};
      if (body.serial !== undefined) set.serial = body.serial;
      if (body.dueDate !== undefined) set.dueDate = startOfUtcDay(body.dueDate);
      if (body.value !== undefined) set.value = toMinor(body.value);
      if (body.remarks !== undefined) set.remarks = nullIfEmpty(body.remarks);
      if (body.isCancelled !== undefined) set.isCancelled = body.isCancelled;
      if (body.payee !== undefined) {
        // "" or null clears the payee
        set.payeeId = body.payee ? (await requirePayee(db, body.payee)).id : null;
      }
      if (Object.keys(set).length) {
        await db.update(cheques).set(set).where(eq(cheques.id, c.get("record").id));
      }
      return c.body(null, NO_CONTENT);
    })
    .openapi(remove, async (c) => {
      await getDb(c.env.DB)
        .delete(cheques)
        .where(eq(cheques.id, c.get("record").id));
      return c.body(null, NO_CONTENT);
    });
};
