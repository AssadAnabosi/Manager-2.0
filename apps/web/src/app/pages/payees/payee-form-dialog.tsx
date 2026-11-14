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
  /** The button that opens the dialog; leave it out to control `open` yourself. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  payee?: PayeeType;
  onDone?: () => void;
};

export default function PayeeFormDialog({
  children,
  payee,
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
