import { z } from "zod";
import {
  dayInput,
  idSchema,
  listQuerySchema,
  moneyInput,
  optionalText,
  requiredMsg,
} from "./common";

const serialInput = z.coerce
  .number({ error: requiredMsg("serial") })
  .int({ error: "Serial must be a whole number" });
const valueInput = moneyInput("value").min(0, {
  error: "Value must be greater than 0",
});

export const createChequeSchema = z
  .object({
    serial: serialInput,
    dueDate: dayInput("due date"),
    value: valueInput,
    remarks: optionalText(),
    payee: z.string().nullable().optional(),
    isCancelled: z.boolean({ error: requiredMsg("isCancelled") }),
  })
  .superRefine((cheque, ctx) => {
    if (cheque.isCancelled === false && !cheque.payee) {
      ctx.addIssue({ code: "custom", message: "Please select a payee" });
    }
  });
export type CreateChequeInput = z.infer<typeof createChequeSchema>;

export const updateChequeSchema = z.looseObject({
  serial: serialInput.optional(),
  dueDate: dayInput("due date").optional(),
  value: valueInput.optional(),
  remarks: optionalText(),
  payee: z.string().nullable().optional(),
  isCancelled: z.boolean().optional(),
});
export type UpdateChequeInput = z.infer<typeof updateChequeSchema>;

export const chequeSchema = z.object({
  id: idSchema,
  serial: z.number(),
  dueDate: z.string(),
  value: z.number(),
  remarks: z.string().optional(),
  payee: z.object({ id: idSchema.nullable(), name: z.string() }),
  isCancelled: z.boolean(),
});

export const chequesQuerySchema = listQuerySchema.extend({
  serial: z.string().optional(),
});

export const chequesListSchema = z.object({
  success: z.literal(true),
  data: z.object({
    cheques: z.array(chequeSchema),
    number: z.number(),
    total: z.number(),
    from: z.string(),
    to: z.string(),
    serial: z.string().nullable(),
    filter: z.union([z.string(), z.array(z.string())]),
  }),
});

export const chequeGetSchema = z.object({
  success: z.literal(true),
  data: z.object({ cheque: chequeSchema }),
});
