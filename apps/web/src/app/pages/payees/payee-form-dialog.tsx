import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { PayeeType } from "@/lib/types";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

import PayeeForm from "./payee-form";

type Props = {
  children: ReactNode;
  payee?: PayeeType;
  onDone?: () => void;
};

export default function PayeeFormDialog({ children, payee, onDone }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {payee ? t("Edit Payee") : t("New Payee")}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {payee
              ? t("Edit the payee details")
              : t("Enter the details for the new payee")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <PayeeForm
            payee={payee}
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
