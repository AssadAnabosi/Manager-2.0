import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;

/** At least 12 characters, no maximum (the request body limit still applies). */
export const passwordSchema = z
  .string({ error: "Please provide a password" })
  .min(PASSWORD_MIN_LENGTH, {
    error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  });
