import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogType } from "@/lib/types";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

import LogForm from "./log-form";

type Props = {
  /** The button that opens the dialog; leave it out to control `open` yourself. */
  children?: ReactNode;
  log?: LogType;
  /** Prefilled values for a new log. */
  defaults?: { worker?: string; date?: Date };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDone?: () => void;
};

export default function LogFormDialog({
  children,
  log,
  defaults,
  open: openProp,
  onOpenChange,
  onDone,
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
            {log ? t("Edit Log") : t("New Log")}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {log
              ? t("Edit the log details")
              : t("Enter the details for the new log")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <LogForm
            log={log}
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
