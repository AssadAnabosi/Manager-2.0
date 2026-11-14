import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";

import { BillType } from "@/lib/types";
import { signedCurrencyFormatter } from "@/lib/utils";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/component/delete-dialog";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import BillFormDialog from "./bill-form-dialog";
import { billKindLabel } from "./kind";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  bill: BillType;
  deleteBill: (id: string) => void;
};

export default function BillDetails({
  title,
  description,
  children,
  bill,
  deleteBill,
}: Props) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {title} - {description}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-start">
            <dt className="text-muted-foreground">{t("Value")}</dt>
            <dd>
              {signedCurrencyFormatter(bill.type, bill.amount)} ·{" "}
              {t(billKindLabel(bill.type))}
            </dd>
            <dt className="text-muted-foreground">{t("Description")}</dt>
            <dd>{bill.description}</dd>
            <dt className="text-muted-foreground">{t("Remarks")}</dt>
            <dd>{bill.remarks}</dd>
          </dl>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          {canWrite && (
            <div className="flex flex-col gap-3 md:flex-row">
              <BillFormDialog bill={bill} onDone={() => setOpen(false)}>
                <Button>
                  <Pencil2Icon className="me-2 h-4 w-4" />
                  <span>{t("Edit")}</span>
                </Button>
              </BillFormDialog>
              <DeleteDialog
                onAction={() => {
                  deleteBill(bill.id);
                  setOpen(false);
                }}
              >
                <Button variant="secondary">
                  <TrashIcon className="me-2 h-4 w-4" />
                  <span>{t("Delete")}</span>
                </Button>
              </DeleteDialog>
            </div>
          )}
          <ResponsiveDialogClose asChild>
            <Button variant="outline">{t("Close")}</Button>
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
