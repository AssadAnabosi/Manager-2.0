import type { TFunction } from "i18next";
import { PASSWORD_MIN_LENGTH, type ValidationIssue } from "@workbench/shared";

/** The error body the API returns; see `@workbench/shared` errors. */
export type ApiErrorBody = {
  code?: string;
  /** English, for logs. Never shown to users. */
  message?: string | string[];
  errors?: ValidationIssue[];
};

const bodyOf = (error: unknown): ApiErrorBody | undefined =>
  (error as { response?: { data?: ApiErrorBody } } | undefined)?.response?.data;

export const apiErrorCode = (error: unknown) => bodyOf(error)?.code;

/** The coded validation issues of a 400, if the API sent any. */
export const apiValidationIssues = (error: unknown): ValidationIssue[] =>
  bodyOf(error)?.errors ?? [];

/** The translation key for an API error (`validation.<code>` or `errors.<CODE>`), if it has a code. */
export function apiErrorKey(error: unknown): string | undefined {
  const body = bodyOf(error);
  const first = body?.errors?.[0];
  if (first) return `validation.${first.code}`;
  if (body?.code) return `errors.${body.code}`;
  return undefined;
}

/** Translated text for an API error, from its code rather than the server's wording. */
export function apiErrorText(error: unknown, t: TFunction): string {
  const key = apiErrorKey(error);
  return key
    ? String(t(key, { min: PASSWORD_MIN_LENGTH }))
    : t("Something went wrong");
}
