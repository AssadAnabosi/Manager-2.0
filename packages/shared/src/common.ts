import { z } from "zod";

export const requiredMsg = (field: string) =>
  `Please provide ${field} in your request's body`;

/** A required string with the standard "please provide" message. */
export const reqString = (field: string) =>
  z.string({ error: requiredMsg(field) });

/** Optional text; `null` and `""` both mean "no value". */
export const optionalText = () => z.string().nullable().optional();

/** A day (`YYYY-MM-DD` or a full ISO string). The API normalizes it to UTC midnight. */
export const dayInput = (field: string) =>
  z.coerce.date({ error: `Please provide a valid ${field}` });

/** Money in major units; numeric strings are accepted. */
export const moneyInput = (field: string) =>
  z.coerce
    .number({ error: `Please provide a valid ${field}` })
    .finite({ error: `Please provide a valid ${field}` });

export const idSchema = z.string();

export const errorSchema = z.object({
  success: z.literal(false),
  message: z.union([z.string(), z.array(z.string())]),
});

export const messageSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

/** Query params shared by the list endpoints. */
export const listQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  filter: z.string().optional(),
});
