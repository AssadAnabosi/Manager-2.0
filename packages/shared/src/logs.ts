import { z } from "zod";
import {
  dayInput,
  idSchema,
  listQuerySchema,
  moneyInput,
  optionalText,
  reqString,
  requiredMsg,
} from "./common";

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeSchema = z
  .string()
  .regex(TIME_RE, { error: "Please provide a valid time" });
export const TIMES_REQUIRED_MSG =
  "Please provide a starting time and finishing time";

/**
 * A log is either an absence (`isAbsent = true`; times are ignored and stored as 00:00)
 * or a worked day with both a starting and a finishing time.
 */
export const createLogSchema = z
  .object({
    date: dayInput("date"),
    worker: reqString("worker"),
    isAbsent: z.boolean({ error: requiredMsg("isAbsent") }),
    startingTime: timeSchema.nullable().optional(),
    finishingTime: timeSchema.nullable().optional(),
    payment: moneyInput("payment").optional(),
    remarks: optionalText(),
  })
  .superRefine((log, ctx) => {
    if (!log.isAbsent && (!log.startingTime || !log.finishingTime)) {
      ctx.addIssue({ code: "custom", message: TIMES_REQUIRED_MSG });
    }
  });
export type CreateLogInput = z.infer<typeof createLogSchema>;

export const updateLogSchema = z
  .looseObject({
    isAbsent: z.boolean().nullable().optional(),
    startingTime: timeSchema.nullable().optional(),
    finishingTime: timeSchema.nullable().optional(),
    payment: moneyInput("payment").optional(),
    remarks: optionalText(),
  })
  .superRefine((log, ctx) => {
    const raw = log as Record<string, unknown>;
    for (const key of ["date", "worker"]) {
      if (raw[key] !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: `You are not authorized to update the ${key} field`,
        });
        return;
      }
    }
    if (log.isAbsent !== true && (!log.startingTime || !log.finishingTime)) {
      ctx.addIssue({ code: "custom", message: TIMES_REQUIRED_MSG });
    }
  });
export type UpdateLogInput = z.infer<typeof updateLogSchema>;

export const logSchema = z.object({
  id: idSchema,
  date: z.string(),
  isAbsent: z.boolean(),
  startingTime: z.string(),
  finishingTime: z.string(),
  OTV: z.number(),
  payment: z.number(),
  remarks: z.string().optional(),
  worker: z.object({ id: idSchema, fullName: z.string() }),
});

export const logsQuerySchema = listQuerySchema;

export const logsListSchema = z.object({
  success: z.literal(true),
  data: z.object({
    logs: z.array(logSchema),
    paymentsSumValue: z.number(),
    daysCount: z.number(),
    OTVSum: z.number(),
    from: z.string(),
    to: z.string(),
    filter: z.union([z.string(), z.array(z.string())]),
  }),
});

export const logGetSchema = z.object({
  success: z.literal(true),
  data: z.object({ log: logSchema }),
});

/** The `data` of a list response. */
export type LogsList = z.infer<typeof logsListSchema>["data"];
