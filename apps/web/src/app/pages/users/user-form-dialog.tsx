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
  /** The button that opens the dialog; leave it out to control `open` yourself. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function UserFormDialog({
  children,
  open: openProp,
  onOpenChange,
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
