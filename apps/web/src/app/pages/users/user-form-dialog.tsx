import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

import UserForm from "./user-form";

type Props = {
  children: ReactNode;
};

export default function UserFormDialog({ children }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("New User")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("Enter the details for the new user")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <UserForm onDone={() => setOpen(false)} />
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
