import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { PayeeType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

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
import { MODERATOR } from "@/lib/constants";

const AvatarCombo = ({
  children,
  title,
  payee,
  deletePayee,
  userRole,
}: {
  children: ReactNode;
  title: string;
  payee: PayeeType;
  deletePayee: (id: string) => void;
  userRole: string | undefined;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    deletePayee(payee.id);
    setOpen(false);
  };

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return isDesktop ? (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="space-x-3 rtl:space-x-reverse">
            <span>{title}</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        {Content({ payee, t })}
        {Footer({
          t,
          isDesktop,
          payee,
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
        <DrawerHeader className="pt-6 text-left rtl:text-right">
          <DrawerTitle className="space-x-3 rtl:space-x-reverse">
            <span>{title}</span>
          </DrawerTitle>
        </DrawerHeader>
        {Content({ t, payee, className: "px-4" })}
        {Footer({
          t,
          isDesktop,
          payee,
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
  payee,
  className,
}: {
  t: any;
  payee: PayeeType;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left rtl:text-right", className)}
    >
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Email")}:</p>
        <a
          aria-label="Email"
          className="text-md font-semibold text-blue-500"
          href={`mailto:${payee.email}`}
        >
          {payee.email}
        </a>
      </div>
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Phone Number")}:</p>
        <a
          style={{ direction: "ltr" }}
          aria-label="Phone Number"
          className="text-md font-semibold text-blue-500"
          href={`tel:${payee.phoneNumber}`}
        >
          {payee.phoneNumber}
        </a>
      </div>
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Remarks")}:</p>
        <p>{payee.remarks}</p>
      </div>
    </div>
  );
};

const Footer = ({
  t,
  isDesktop,
  payee,
  userRole,
  setOpen,
  handleDelete,
}: {
  t: any;
  isDesktop: boolean;
  payee: PayeeType;
  userRole: string | undefined;
  setOpen: any;
  handleDelete: any;
}) => {
  const footerContent = (
    <>
      <FormDialogDrawer
        payee={payee}
        onClose={(status) => {
          if (status == false) setOpen(false);
        }}
      >
        <Button>
          <Pencil2Icon className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          <span>{t("Edit")}</span>
        </Button>
      </FormDialogDrawer>
      {userRole !== MODERATOR && (
        <DeleteDialog onAction={handleDelete}>
          <Button variant={"secondary"}>
            <TrashIcon className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            <span>{t("Delete")}</span>
          </Button>
        </DeleteDialog>
      )}
    </>
  );
  return isDesktop ? (
    <AlertDialogFooter className="gap-3">
      <div className="flex flex-row gap-3">{footerContent}</div>
      <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
    </AlertDialogFooter>
  ) : (
    <DrawerFooter className="px-4 pt-2">
      <div className="flex flex-col gap-3">{footerContent}</div>
      <DrawerClose asChild>
        <Button variant="outline">{t("Close")}</Button>
      </DrawerClose>
    </DrawerFooter>
  );
};

export default AvatarCombo;
