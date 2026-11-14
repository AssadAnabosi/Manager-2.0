import { BillKind } from "@/lib/types";

export const BILL_KINDS: BillKind[] = ["expense", "income"];

/** Display label of a bill type. */
export const billKindLabel = (kind: BillKind) =>
  kind === "expense" ? "Spent" : "Received";

/** Text colour for a bill type (red = money out, green = money in). */
export const billKindColor = (kind: BillKind) =>
  kind === "expense"
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
