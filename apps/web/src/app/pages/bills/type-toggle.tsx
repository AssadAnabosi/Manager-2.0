import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { BillKind } from "@/lib/types";
import { BILL_KINDS, billKindLabel } from "./kind";

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
              "flex-1 rounded-sm px-3 py-2.5 text-sm md:py-1.5 font-medium transition-colors disabled:opacity-50",
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
