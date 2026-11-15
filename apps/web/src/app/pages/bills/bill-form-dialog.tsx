import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { BillType } from "@/lib/types";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

import BillForm, { type BillDefaults } from "./bill-form";

type Props = {
  /** The button that opens the dialog; leave it out to control `open` yourself. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  bill?: BillType;
  /** Prefilled values for a new bill. */
  defaults?: BillDefaults;
  onDone?: () => void;
};

export default function BillFormDialog({
  children,
  bill,
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
            {bill ? t("Edit Bill") : t("New Bill")}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {bill
              ? t("Edit the bill details")
              : t("Enter the details for the new bill")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <BillForm
            bill={bill}
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
