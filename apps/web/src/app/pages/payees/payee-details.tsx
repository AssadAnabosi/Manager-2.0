import { ReactNode, useState } from "react";
import { useEditFromDetails } from "@/hooks/use-edit-from-details";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";

import { PayeeType } from "@/lib/types";

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

import PayeeFormDialog from "./payee-form-dialog";

type Props = {
  children: ReactNode;
  title: string;
  payee: PayeeType;
  deletePayee: (id: string) => void;
};

export default function PayeeDetails({
  children,
  title,
  payee,
  deletePayee,
}: Props) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const [open, setOpen] = useState(false);

  const { editing, setEditing, startEditing } = useEditFromDetails(() =>
    setOpen(false)
  );

  return (
    <>
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-start">
            <dt className="text-muted-foreground">{t("Email")}</dt>
            <dd>
              <a
                className="font-semibold text-blue-500"
                href={`mailto:${payee.email}`}
              >
                {payee.email}
              </a>
            </dd>
            <dt className="text-muted-foreground">{t("Phone Number")}</dt>
            <dd>
              <a
                dir="ltr"
                className="font-semibold text-blue-500"
                href={`tel:${payee.phoneNumber}`}
              >
                {payee.phoneNumber}
              </a>
            </dd>
            <dt className="text-muted-foreground">{t("Remarks")}</dt>
            <dd>{payee.remarks}</dd>
          </dl>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          {canWrite && (
            <div className="flex flex-col gap-3 md:flex-row">
              <Button onClick={startEditing}>
                  <Pencil2Icon className="me-2 h-4 w-4" />
                  <span>{t("Edit")}</span>
                </Button>
              <DeleteDialog
                onAction={() => {
                  deletePayee(payee.id);
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
    {canWrite && (
      <PayeeFormDialog payee={payee} open={editing} onOpenChange={setEditing} />
    )}
    </>
  );
}
