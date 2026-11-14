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
      <Printer className="h-6 w-6 ltr:mr-2 rtl:ml-2" /> {t("Print")}
    </Button>
  );
}
