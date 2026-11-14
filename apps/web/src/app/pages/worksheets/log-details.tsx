import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";

import { LogType } from "@/lib/types";
import { numberFormatter, currencyFormatter } from "@/lib/utils";

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

import LogFormDialog from "./log-form-dialog";

type Props = {
  children: ReactNode;
  title: string;
  description?: string | JSX.Element;
  log: LogType;
  deleteLog: (id: string) => void;
};

export default function LogDetails({
  children,
  title,
  description,
  log,
  deleteLog,
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
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 text-start">
            <dt className="text-muted-foreground">{t("Status")}</dt>
            <dd>
              <StatusBadge status={!log.isAbsent} />
            </dd>
            <dt className="text-muted-foreground">{t("Work Hours")}</dt>
            <dd>
              {log.startingTime} - {log.finishingTime} (
              {numberFormatter(log.OTV)})
            </dd>
            <dt className="text-muted-foreground">{t("Payment")}</dt>
            <dd>{currencyFormatter(log.payment)}</dd>
            <dt className="text-muted-foreground">{t("Remarks")}</dt>
            <dd>{log.remarks}</dd>
          </dl>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          {canWrite && (
            <div className="flex flex-col gap-3 md:flex-row">
              <LogFormDialog log={log} onDone={() => setOpen(false)}>
                <Button>
                  <Pencil2Icon className="me-2 h-4 w-4" />
                  <span>{t("Edit")}</span>
                </Button>
              </LogFormDialog>
              <DeleteDialog
                onAction={() => {
                  deleteLog(log.id);
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
