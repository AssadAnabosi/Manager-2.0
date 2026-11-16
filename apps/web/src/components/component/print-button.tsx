import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <Button
      disabled={disabled}
      className="w-full print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="me-2 h-6 w-6" /> {t("Print")}
    </Button>
  );
}
