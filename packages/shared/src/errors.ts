/**
 * The error contract between the API and its clients.
 *
 * Every error response is `{ success: false, code, message }`. `code` is stable and is what
 * clients translate (`errors.<CODE>`); `message` is English, for logs and API consumers, and
 * may change freely. Validation failures use the code `VALIDATION_FAILED` and also carry
 * `errors: [{ code, path }]` where `code` is one of `VALIDATION_CODES`.
 */

/** Error code -> default English message. Dynamic messages (ids, names) override it per throw. */
export const ERROR_MESSAGES = {
  // authentication and sessions
  AUTH_NOT_AUTHENTICATED: "Not Authenticated To Access This Route",
  AUTH_TOKEN_EXPIRED: "Token Expired, Please Refresh Token",
  AUTH_LOGIN_AGAIN: "Please Login Again",
  AUTH_REFRESH_EXPIRED: "Token Expired, Please Login Again",
  AUTH_INVALID_CREDENTIALS: "Invalid Credentials",
  AUTH_ACCOUNT_DEACTIVATED: "Your account has been deactivated",
  AUTH_NOT_LOGGED_IN: "You are not logged in",
  AUTH_USER_NOT_FOUND: "User Can Not Be Found",
  AUTH_USER_DELETED: "User account deleted",
  TOO_MANY_REQUESTS: "Too many requests from this IP, please try again in a while",
  FORBIDDEN: "Not Authorized To Access This Route",
  // requests
  VALIDATION_FAILED: "Validation failed",
  REQUEST_INVALID: "Invalid request",
  PAYLOAD_TOO_LARGE: "Request body is too large",
  INVALID_ID: "Please provide a valid ID",
  INVALID_DATE: "Please provide a valid date",
  INVALID_FILTER: "Please provide a valid filter",
  INVALID_BILL_TYPE: "Invalid bill type",
  // missing things
  ROUTE_NOT_FOUND:
    "Oops, you have reached an undefined route, please check your request and try again",
  RECORD_NOT_FOUND: "Record not found",
  PAYEE_NOT_FOUND: "Payee not found",
  WORKER_NOT_FOUND: "Worker not found",
  // conflicts
  USERNAME_TAKEN: "Username is already taken",
  CHEQUE_SERIAL_EXISTS: "Serial already exists",
  PAYEE_NAME_EXISTS: "Name already exists",
  LOG_EXISTS: "There is a record of this log already",
  ALREADY_EXISTS: "Already exists",
  // rules
  LOG_FORBIDDEN: "You are not authorized to access this log",
  CURRENT_PASSWORD_INVALID: "Invalid current password",
  CANNOT_DELETE_SELF: "You are not authorized to delete your own account",
  CANNOT_CHANGE_OWN_ROLE: "You are not authorized to change your role",
  CANNOT_DEACTIVATE_SELF: "You are not authorized to deactivate your own account",
  // everything else
  INTERNAL_ERROR: "Internal Server Error",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;
export const ERROR_CODES = Object.keys(ERROR_MESSAGES) as ErrorCode[];

/** Validation codes: the stable identity of the validation messages used by the shared schemas. */
export const VALIDATION_CODES = [
  "required",
  "invalid_value",
  "email_invalid",
  "time_invalid",
  "times_required",
  "username_chars",
  "field_not_updatable",
  "theme_invalid",
  "language_invalid",
  "role_invalid",
  "active_invalid",
  "bill_type_invalid",
  "amount_positive",
  "value_positive",
  "serial_integer",
  "payee_required",
  "name_required",
  "password_required",
  "password_min",
  "invalid",
] as const;

export type ValidationCode = (typeof VALIDATION_CODES)[number];

// Exact messages first, then patterns for the ones that interpolate a field or a list.
const EXACT: Record<string, ValidationCode> = {
  "Please provide a valid email": "email_invalid",
  "Please provide a valid time": "time_invalid",
  "Please provide a starting time and finishing time": "times_required",
  "Username can only contain letters, numbers, hyphens, underscores, and periods":
    "username_chars",
  "Invalid active status": "active_invalid",
  "Amount must be greater than 0": "amount_positive",
  "Value must be greater than 0": "value_positive",
  "Serial must be a whole number": "serial_integer",
  "Please select a payee": "payee_required",
  "Please provide a name": "name_required",
  "Please provide a password": "password_required",
};

const PATTERNS: [RegExp, ValidationCode][] = [
  [/^Please provide .+ in your request's body$/, "required"],
  [/^Please provide a valid .+$/, "invalid_value"],
  [/^You are not authorized to update the .+ field$/, "field_not_updatable"],
  [/^Invalid theme\b/, "theme_invalid"],
  [/^Invalid language\b/, "language_invalid"],
  [/^Invalid User Role\b/, "role_invalid"],
  [/^Invalid bill type\b/, "bill_type_invalid"],
  [/^Password must be at least \d+ characters long$/, "password_min"],
];

/** The validation code for a shared-schema message, or undefined for any other text. */
export function validationCode(message: string): ValidationCode | undefined {
  const exact = EXACT[message];
  if (exact) return exact;
  return PATTERNS.find(([re]) => re.test(message))?.[1];
}

export type ValidationIssue = { code: ValidationCode; path: string };
