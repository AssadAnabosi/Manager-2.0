import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChequeType } from "@/lib/types";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

import ChequeForm from "./cheque-form";

type Props = {
  /** The button that opens the dialog; leave it out to control `open` yourself. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  cheque?: ChequeType;
  /** Prefilled values for a new cheque. */
  defaults?: { serial?: string };
  onDone?: () => void;
};

export default function ChequeFormDialog({
  children,
  cheque,
  defaults,
  onDone,
  open: openProp,
  onOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const setOpen = onOpenChange ?? setInner;
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      {children && (
        <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      )}
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {cheque
              ? t("Edit Cheque #{{serial}}", { serial: cheque.serial })
              : t("New Cheque")}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {cheque
              ? t("Edit the cheque details")
              : t("Enter the details for the new cheque")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <ChequeForm
            cheque={cheque}
            defaults={defaults}
            onDone={() => {
              setOpen(false);
              onDone?.();
            }}
          />
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
