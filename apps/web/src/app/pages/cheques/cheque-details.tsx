import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { usePermissions } from "@/hooks/use-permissions";

import { ChequeType } from "@/lib/types";

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
import StatusBadge from "@/components/component/status-badge";
import DeleteDialog from "@/components/component/delete-dialog";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import ChequeFormDialog from "./cheque-form-dialog";

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
  cheque: ChequeType;
  deleteCheque: (id: string) => void;
};

export default function ChequeDetails({
  children,
  title,
  description,
  cheque,
  deleteCheque,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { canWrite } = usePermissions();
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {t("Cheque #{{serial}}", { serial: cheque.serial })}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 text-start">
            <dt className="text-muted-foreground">{t("Payee")}</dt>
            <dd>{title}</dd>
            <dt className="text-muted-foreground">{t("Due Date")}</dt>
            <dd>{description}</dd>
            <dt className="text-muted-foreground">{t("Value")}</dt>
            <dd>{fmt.currency(cheque.value)}</dd>
            <dt className="text-muted-foreground">{t("Remarks")}</dt>
            <dd>{cheque.remarks}</dd>
            <dt className="text-muted-foreground">{t("Status")}</dt>
            <dd>
              <StatusBadge
                status={!cheque.isCancelled}
                labels={[t("Valid"), t("Cancelled")]}
              />
            </dd>
          </dl>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          {canWrite && (
            <div className="flex flex-col gap-3 md:flex-row">
              <ChequeFormDialog cheque={cheque} onDone={() => setOpen(false)}>
                <Button>
                  <Pencil2Icon className="me-2 h-4 w-4" />
                  <span>{t("Edit")}</span>
                </Button>
              </ChequeFormDialog>
              <DeleteDialog
                onAction={() => {
                  deleteCheque(cheque.id);
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
