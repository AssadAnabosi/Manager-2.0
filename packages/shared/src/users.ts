import { z } from "zod";
import { LANGUAGES, ROLES, THEMES } from "./constants";
import { optionalText, reqString, requiredMsg } from "./common";
import { passwordSchema } from "./password";
import { userSchema } from "./auth";

const USERNAME_MSG =
  "Username can only contain letters, numbers, hyphens, underscores, and periods";
const USERNAME_RE = /^[a-zA-Z0-9\-_.]+$/;

export const usernameSchema = reqString("username").regex(USERNAME_RE, {
  error: USERNAME_MSG,
});

const EMAIL_RE =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const emailSchema = z
  .string()
  .refine((v) => v === "" || EMAIL_RE.test(v), {
    error: "Please provide a valid email",
  })
  .nullable()
  .optional();

export const registerUserSchema = z.object({
  firstName: reqString("firstName"),
  lastName: reqString("lastName"),
  username: usernameSchema,
  email: emailSchema,
  phoneNumber: optionalText(),
  password: passwordSchema,
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

const FORBIDDEN_USER_UPDATE = ["password", "role", "active"] as const;

export const updateUserSchema = z
  .looseObject({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    username: z.string().regex(USERNAME_RE, { error: USERNAME_MSG }).optional(),
    email: emailSchema,
    phoneNumber: optionalText(),
    theme: z.enum(THEMES).optional(),
    language: z.enum(LANGUAGES).optional(),
  })
  .superRefine((body, ctx) => {
    for (const key of FORBIDDEN_USER_UPDATE) {
      if ((body as Record<string, unknown>)[key] !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: `You are not authorized to update the ${key} field`,
        });
        return;
      }
    }
  });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updatePasswordSchema = z.object({
  current: reqString("current"),
  new: passwordSchema,
});

export const preferencesSchema = z.object({
  theme: z.enum(THEMES, {
    error: (issue) =>
      issue.input === undefined
        ? requiredMsg("theme")
        : `Invalid theme [${THEMES.toString()}]`,
  }),
  language: z.enum(LANGUAGES, {
    error: (issue) =>
      issue.input === undefined
        ? requiredMsg("language")
        : `Invalid language [${LANGUAGES.toString()}]`,
  }),
});

export const checkUsernameSchema = z.object({
  username: reqString("username"),
});

export const resetPasswordSchema = z.object({ password: passwordSchema });

export const updateRoleSchema = z.object({
  role: z.enum(ROLES, {
    error: (issue) =>
      issue.input === undefined
        ? requiredMsg("role")
        : `Invalid User Role [${ROLES.toString()}]`,
  }),
});

export const updateStatusSchema = z.object({
  active: z.boolean({
    error: (issue) =>
      issue.input === undefined
        ? requiredMsg("active")
        : "Invalid active status",
  }),
});

/** A user as listed or fetched by id (includes `active`). */
export const userDetailSchema = userSchema.extend({ active: z.boolean() });

export const usersQuerySchema = z.object({
  search: z.string().optional(),
  active: z.string().optional(),
});
