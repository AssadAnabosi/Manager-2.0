import { ReactElement, ReactNode, useState } from "react";
import { useEditFromDetails } from "@/hooks/use-edit-from-details";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { usePermissions } from "@/hooks/use-permissions";

import { LogType } from "@/lib/types";

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
  /** The element that opens the details; leave it out to control `open` yourself. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string | ReactElement;
  log: LogType;
  deleteLog: (id: string) => void;
};

export default function LogDetails({
  children,
  open: openProp,
  onOpenChange,
  title,
  description,
  log,
  deleteLog,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { canWrite } = usePermissions();
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const setOpen = onOpenChange ?? setInner;

  const { editing, setEditing, startEditing } = useEditFromDetails(() =>
    setOpen(false)
  );

  return (
    <>
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      {children && (
        <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      )}
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
              <StatusBadge
                status={!log.isAbsent}
                labels={[t("Attended"), t("Absent")]}
              />
            </dd>
            <dt className="text-muted-foreground">{t("Work Hours")}</dt>
            <dd>
              {log.startingTime} - {log.finishingTime} ({fmt.number(log.OTV)})
            </dd>
            <dt className="text-muted-foreground">{t("Payment")}</dt>
            <dd>{fmt.currency(log.payment)}</dd>
            <dt className="text-muted-foreground">{t("Remarks")}</dt>
            <dd>{log.remarks}</dd>
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
    {canWrite && (
      <LogFormDialog log={log} open={editing} onOpenChange={setEditing} />
    )}
    </>
  );
}
