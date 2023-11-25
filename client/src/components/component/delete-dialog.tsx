import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useTranslation } from "react-i18next";

type ComponentProps = {
  children: ReactNode;
  onClick: () => void;
};

export default function DeleteAlertDialog({
  children,
  onClick,
}: ComponentProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "This action cannot be undone. This will permanently delete document from our database."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>{t("Delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
