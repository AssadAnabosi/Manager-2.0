import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
// import { useMediaQuery } from "@/hooks/use-media-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import UserForm from "./form";

type ComponentProps = {
  children: ReactNode;
  onClose?: (status: boolean) => void;
};

export default function FormDialogDrawer({
  children,
  onClose,
}: ComponentProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const isDesktop = true;
  const title = t("New User");
  const description = t("Enter the details for the new user");
  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <UserForm setOpen={setOpen} onClose={onClose} />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left rtl:text-right pt-6">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <UserForm
          className="px-4"
          setOpen={setOpen}
          onClose={onClose}
          isDesktop={isDesktop}
        />
      </DrawerContent>
    </Drawer>
  );
}
