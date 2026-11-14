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

import BillForm from "./bill-form";

type Props = {
  children: ReactNode;
  bill?: BillType;
  onDone?: () => void;
};

export default function BillFormDialog({ children, bill, onDone }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
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
