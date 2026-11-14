import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BillKind } from "@/lib/types";
import { BILL_KINDS, billKindLabel } from "./kind";

/** All / Spent / Received filter chips; `value` is `""` for all. */
const TypeFilter = ({
  value,
  onChange,
}: {
  value: BillKind | "";
  onChange: (value: BillKind | "") => void;
}) => {
  const { t } = useTranslation();
  const options: { value: BillKind | ""; label: string }[] = [
    { value: "", label: "All" },
    ...BILL_KINDS.map((kind) => ({ value: kind, label: billKindLabel(kind) })),
  ];
  return (
    <div
      role="group"
      aria-label={t("Type")}
      className="flex gap-2 print:hidden"
    >
      {options.map((option) => (
        <Button
          key={option.value || "all"}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {t(option.label)}
        </Button>
      ))}
    </div>
  );
};

export default TypeFilter;
