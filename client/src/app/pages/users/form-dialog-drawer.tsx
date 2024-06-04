import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/use-media-query";

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
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const title = t("New User");
  const description = t("Enter the details for the new user");
  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pt-6 text-left rtl:text-right">
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
        <DrawerHeader className="pt-6 text-left rtl:text-right">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto">
          <UserForm
            className="px-4"
            setOpen={setOpen}
            onClose={onClose}
            isDesktop={isDesktop}
          />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
