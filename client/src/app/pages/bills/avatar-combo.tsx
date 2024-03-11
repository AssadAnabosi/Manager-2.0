import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { BillType } from "@/lib/types";
// import { useMediaQuery } from "@/hooks/use-media-query";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import FormDialogDrawer from "./form-dialog-drawer";
import DeleteDialog from "@/components/component/delete-dialog";

import { cn, numberFormatter } from "@/lib/utils";
import { SPECTATOR } from "@/lib/constants";

const AvatarCombo = ({
  title,
  description,
  children,
  bill,
  deleteBill,
  userRole,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  bill: BillType;
  deleteBill: (id: string) => void;
  userRole: string | undefined;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleDelete = async () => {
    deleteBill(bill.id);
    setOpen(false);
  };
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const isDesktop = true;
  return isDesktop ? (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="space-x-3 rtl:space-x-reverse">
            <span>{title}</span>
            <span>-</span>
            <span>{description}</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        {Content({ bill, t })}
        {Footer({
          t,
          isDesktop,
          bill,
          userRole,
          setOpen,
          handleDelete,
        })}
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left rtl:text-right pt-6">
          <DrawerTitle className="space-x-3 rtl:space-x-reverse">
            <span>{title}</span>
            <span>-</span>
            <span>{description}</span>
          </DrawerTitle>
        </DrawerHeader>
        {Content({ t, bill, className: "px-4" })}
        {Footer({
          t,
          isDesktop,
          bill,
          userRole,
          setOpen,
          handleDelete,
        })}
      </DrawerContent>
    </Drawer>
  );
};

const Content = ({
  t,
  bill,
  className,
}: {
  t: any;
  bill: BillType;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left rtl:text-right", className)}
    >
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Value")}:</p>
        <p>{numberFormatter(bill.value)}</p>
      </div>
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Description")}:</p>
        <p>{bill.description}</p>
      </div>
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Remarks")}:</p>
        <p>{bill.remarks}</p>
      </div>
    </div>
  );
};

const Footer = ({
  t,
  isDesktop,
  bill,
  userRole,
  setOpen,
  handleDelete,
}: {
  t: any;
  isDesktop: boolean;
  bill: BillType;
  userRole: string | undefined;
  setOpen: any;
  handleDelete: any;
}) => {
  const footerContent =
    userRole !== SPECTATOR ? (
      <div className="flex flex-col gap-3 md:flex-row">
        <FormDialogDrawer
          bill={bill}
          onClose={(status) => {
            if (status == false) setOpen(false);
          }}
        >
          <Button>
            <Pencil2Icon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            <span>{t("Edit")}</span>
          </Button>
        </FormDialogDrawer>
        <DeleteDialog onAction={handleDelete}>
          <Button variant={"secondary"}>
            <TrashIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            <span>{t("Delete")}</span>
          </Button>
        </DeleteDialog>
      </div>
    ) : null;
  return isDesktop ? (
    <AlertDialogFooter className="gap-3">
      <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
      {footerContent}
    </AlertDialogFooter>
  ) : (
    <DrawerFooter>
      <DrawerClose asChild>
        <Button variant="outline">{t("Close")}</Button>
      </DrawerClose>
      {footerContent}
    </DrawerFooter>
  );
};

export default AvatarCombo;
