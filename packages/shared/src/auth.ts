import { z } from "zod";
import { LANGUAGES, ROLES, THEMES } from "./constants";

export const loginSchema = z.object({
  username: z.string({
    error: "Please provide username in your request's body",
  }),
  password: z.string({
    error: "Please provide password in your request's body",
  }),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** A user as returned by the API (never includes the password or `active`). */
export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  username: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(ROLES),
  theme: z.enum(THEMES),
  language: z.enum(LANGUAGES),
});
export type UserDTO = z.infer<typeof userSchema>;

export const authSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.object({
    user: userSchema,
    accessToken: z.string(),
  }),
});

export const meSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({ user: userSchema }),
});

export const messageSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

export const errorSchema = z.object({
  success: z.literal(false),
  message: z.union([z.string(), z.array(z.string())]),
});
