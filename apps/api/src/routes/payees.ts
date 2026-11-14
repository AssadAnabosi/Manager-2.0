import { createRoute, z } from "@hono/zod-openapi";
import { asc, eq, or } from "drizzle-orm";
import {
  USER,
  ADMIN,
  MODERATOR,
  createPayeeSchema,
  payeeGetSchema,
  payeesListSchema,
  payeesQuerySchema,
  updatePayeeSchema,
} from "@workbench/shared";
import { getDb } from "../db";
import { payees, type PayeeRow } from "../db/schema";
import { CREATED, NO_CONTENT, OK } from "../lib/http";
import { containsLike, nullIfEmpty } from "../lib/query";
import { authorize, notAuthorized } from "../middleware/auth";
import { paramRecord } from "../middleware/params";
import {
  bearer,
  createRouter,
  errorResponse,
  protectedErrors,
  jsonResponse,
} from "./router";

export const serializePayee = (p: PayeeRow) => ({
  id: p.id,
  name: p.name,
  ...(p.email ? { email: p.email } : {}),
  ...(p.phoneNumber ? { phoneNumber: p.phoneNumber } : {}),
  ...(p.remarks ? { remarks: p.remarks } : {}),
});

const params = z.object({ payeeID: z.string() });
const mount = notAuthorized([USER]);
const write = authorize([MODERATOR, ADMIN]);
const load = paramRecord("payeeID", payees);

const badId = {
  400: errorResponse("Validation error or malformed ID"),
  404: errorResponse("Payee not found"),
};

export const payeesRoutes = () => {
  const list = createRoute({
    method: "get",
    path: "/payees",
    tags: ["Payees"],
    summary: "List payees",
    security: bearer,
    middleware: [mount],
    request: { query: payeesQuerySchema },
    responses: {
      200: jsonResponse("Payees", payeesListSchema),
      ...protectedErrors,
    },
  });
  const create = createRoute({
    method: "post",
    path: "/payees",
    tags: ["Payees"],
    summary: "Create a payee",
    security: bearer,
    middleware: [mount, write],
    request: {
      body: { content: { "application/json": { schema: createPayeeSchema } } },
    },
    responses: {
      201: { description: "Created" },
      400: errorResponse("Validation error"),
      409: errorResponse("Name already exists"),
      ...protectedErrors,
    },
  });
  const get = createRoute({
    method: "get",
    path: "/payees/{payeeID}",
    tags: ["Payees"],
    summary: "Get a payee",
    security: bearer,
    middleware: [mount, load],
    request: { params },
    responses: {
      200: jsonResponse("The payee", payeeGetSchema),
      ...badId,
      ...protectedErrors,
    },
  });
  const update = createRoute({
    method: "put",
    path: "/payees/{payeeID}",
    tags: ["Payees"],
    summary: "Update a payee",
    security: bearer,
    middleware: [mount, write, load],
    request: {
      params,
      body: { content: { "application/json": { schema: updatePayeeSchema } } },
    },
    responses: {
      204: { description: "Updated" },
      409: errorResponse("Name already exists"),
      ...badId,
      ...protectedErrors,
    },
  });
  const remove = createRoute({
    method: "delete",
    path: "/payees/{payeeID}",
    tags: ["Payees"],
    summary: "Delete a payee (its cheques keep existing with no payee)",
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
      const { search = "" } = c.req.valid("query");
      const term = search;
      const rows = await getDb(c.env.DB)
        .select()
        .from(payees)
        .where(
          or(containsLike(payees.name, term), containsLike(payees.remarks, term))
        )
        .orderBy(asc(payees.createdAt));
      return c.json(
        {
          success: true as const,
          data: { payees: rows.map(serializePayee), search },
        },
        OK
      );
    })
    .openapi(create, async (c) => {
      const body = c.req.valid("json");
      await getDb(c.env.DB)
        .insert(payees)
        .values({
          name: body.name,
          email: nullIfEmpty(body.email),
          phoneNumber: nullIfEmpty(body.phoneNumber),
          remarks: nullIfEmpty(body.remarks),
        });
      return c.body(null, CREATED);
    })
    .openapi(get, (c) =>
      c.json(
        { success: true as const, data: { payee: serializePayee(c.get("record")) } },
        OK
      )
    )
    .openapi(update, async (c) => {
      const body = c.req.valid("json");
      const set: Partial<typeof payees.$inferInsert> = {};
      if (body.name !== undefined) set.name = body.name;
      if (body.email !== undefined) set.email = nullIfEmpty(body.email);
      if (body.phoneNumber !== undefined)
        set.phoneNumber = nullIfEmpty(body.phoneNumber);
      if (body.remarks !== undefined) set.remarks = nullIfEmpty(body.remarks);
      const db = getDb(c.env.DB);
      if (Object.keys(set).length) {
        await db.update(payees).set(set).where(eq(payees.id, c.get("record").id));
      }
      return c.body(null, NO_CONTENT);
    })
    .openapi(remove, async (c) => {
      // cheques.payee_id is ON DELETE SET NULL
      await getDb(c.env.DB).delete(payees).where(eq(payees.id, c.get("record").id));
      return c.body(null, NO_CONTENT);
    });
};
