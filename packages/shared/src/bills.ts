import { z } from "zod";
import { BILL_TYPES } from "./constants";
import {
  dayInput,
  idSchema,
  moneyInput,
  optionalText,
  reqString,
  requiredMsg,
} from "./common";

const typeSchema = z.enum(BILL_TYPES, {
  error: (issue) =>
    issue.input === undefined
      ? requiredMsg("type")
      : `Invalid bill type [${BILL_TYPES.toString()}]`,
});
const amountSchema = moneyInput("amount").positive({
  error: "Amount must be greater than 0",
});

export const createBillSchema = z.object({
  date: dayInput("date"),
  type: typeSchema,
  amount: amountSchema,
  description: reqString("description").min(1, {
    error: "Please provide a description",
  }),
  remarks: optionalText(),
});
export type CreateBillInput = z.infer<typeof createBillSchema>;

export const updateBillSchema = z.looseObject({
  date: dayInput("date").optional(),
  type: typeSchema.optional(),
  amount: amountSchema.optional(),
  description: z
    .string()
    .min(1, { error: "Please provide a description" })
    .optional(),
  remarks: optionalText(),
});
export type UpdateBillInput = z.infer<typeof updateBillSchema>;

export const billSchema = z.object({
  id: idSchema,
  date: z.string(),
  type: z.enum(BILL_TYPES),
  amount: z.number(),
  description: z.string(),
  remarks: z.string().optional(),
});

export const billsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  type: z.string().optional(),
});

const totalsSchema = z.object({
  spent: z.number(),
  received: z.number(),
  net: z.number(),
});

export const billsListSchema = z.object({
  success: z.literal(true),
  data: z.object({
    bills: z.array(billSchema),
    totals: z.object({ range: totalsSchema, allTime: totalsSchema }),
    from: z.string(),
    to: z.string(),
    search: z.string(),
  }),
});

export const billGetSchema = z.object({
  success: z.literal(true),
  data: z.object({ bill: billSchema }),
});

/** The `data` of a list response. */
export type BillsList = z.infer<typeof billsListSchema>["data"];
