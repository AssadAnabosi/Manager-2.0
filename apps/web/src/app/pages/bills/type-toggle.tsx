import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
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

/** Spent / Received segmented toggle used by the bill form. */
const TypeToggle = ({
  value,
  onChange,
  disabled,
}: {
  value: BillKind;
  onChange: (value: BillKind) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={t("Type")}
      className="inline-flex w-full rounded-md border p-1"
    >
      {BILL_KINDS.map((kind) => {
        const selected = value === kind;
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(kind)}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              selected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t(billKindLabel(kind))}
          </button>
        );
      })}
    </div>
  );
};

export default TypeToggle;
