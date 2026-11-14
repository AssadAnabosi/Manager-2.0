import { z } from "zod";
import { idSchema, optionalText, reqString } from "./common";

export const createPayeeSchema = z.object({
  name: reqString("name").min(1, { error: "Please provide a name" }),
  email: optionalText(),
  phoneNumber: optionalText(),
  remarks: optionalText(),
});
export type CreatePayeeInput = z.infer<typeof createPayeeSchema>;

export const updatePayeeSchema = z.looseObject({
  name: z.string().min(1, { error: "Please provide a name" }).optional(),
  email: optionalText(),
  phoneNumber: optionalText(),
  remarks: optionalText(),
});
export type UpdatePayeeInput = z.infer<typeof updatePayeeSchema>;

export const payeeSchema = z.object({
  id: idSchema,
  name: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export const payeesQuerySchema = z.object({ search: z.string().optional() });

export const payeesListSchema = z.object({
  success: z.literal(true),
  data: z.object({ payees: z.array(payeeSchema), search: z.string() }),
});

export const payeeGetSchema = z.object({
  success: z.literal(true),
  data: z.object({ payee: payeeSchema }),
});
