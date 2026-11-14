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
  children: ReactNode;
  cheque?: ChequeType;
  onDone?: () => void;
};

export default function ChequeFormDialog({ children, cheque, onDone }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
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
