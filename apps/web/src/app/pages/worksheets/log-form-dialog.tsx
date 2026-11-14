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
  children: ReactNode;
  log?: LogType;
  onDone?: () => void;
};

export default function LogFormDialog({ children, log, onDone }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
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
