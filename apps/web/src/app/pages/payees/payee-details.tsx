import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { PayeeType } from "@/lib/types";
import { MODERATOR } from "@/lib/constants";

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
  userRole: string | undefined;
};

export default function PayeeDetails({
  children,
  title,
  payee,
  deletePayee,
  userRole,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
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
          <div className="flex flex-col gap-3 md:flex-row">
            <PayeeFormDialog payee={payee} onDone={() => setOpen(false)}>
              <Button>
                <Pencil2Icon className="me-2 h-4 w-4" />
                <span>{t("Edit")}</span>
              </Button>
            </PayeeFormDialog>
            {userRole !== MODERATOR && (
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
            )}
          </div>
          <ResponsiveDialogClose asChild>
            <Button variant="outline">{t("Close")}</Button>
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
