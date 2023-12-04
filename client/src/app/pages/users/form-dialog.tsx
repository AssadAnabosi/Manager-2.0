import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import UserForm from "./form";

type ComponentProps = {
  children: ReactNode;
  onClose?: (status: boolean) => void;
};

export default function FormDialog({ children, onClose }: ComponentProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{t("New User")}</DialogTitle>
          <DialogDescription>
            {t("Enter the details for the new user")}
          </DialogDescription>
        </DialogHeader>
        <UserForm setOpen={setOpen} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
