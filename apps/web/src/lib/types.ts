import type {
  BillsList,
  ChequesList,
  LogsList,
  PayeesList,
} from "@workbench/shared";

export type ThemeType = "dark" | "light" | "system";
export type LanguageType = "en" | "ar";

export type UserType = {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  loggable: boolean;
  theme: string;
  language: string;
};

export type CreateLogType = {
  date: Date | string;
  isAbsent: boolean;
  startingTime: string;
  finishingTime: string;
  OTV: number;
  payment: number;
  remarks: string;
  worker: string;
};

export type BillKind = "expense" | "income";

export type BillTotals = { spent: number; received: number; net: number };

export type ListType = {
  value: string;
  label: string;
  active?: boolean;
  /** false: only offered once something is typed in the search box. */
  loggable?: boolean;
};

// Records as the API returns them, derived from the shared response schemas.
export type LogType = LogsList["logs"][number];
export type BillType = BillsList["bills"][number];
export type ChequeType = ChequesList["cheques"][number];
export type PayeeType = PayeesList["payees"][number];
