import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MODERATOR } from "@/lib/constants";
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
import StatusBadge from "@/components/component/status-badge";

import RoleBadge from "./role-badge";

import { Pencil2Icon } from "@radix-ui/react-icons";

const AvatarCombo = ({
  children,
  title,
  user,
  userRole,
}: {
  children: ReactNode;
  title: string;
  user: UserType;
  userRole: string | undefined;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const Navigate = useNavigate();

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
        {Content({ user, t })}
        {Footer({
          t,
          isDesktop,
          user,
          userRole,
          Navigate,
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
        {Content({ t, user, className: "px-4" })}
        {Footer({
          t,
          isDesktop,
          user,
          userRole,
          Navigate,
        })}
      </DrawerContent>
    </Drawer>
  );
};

const Content = ({
  t,
  user,
  className,
}: {
  t: any;
  user: UserType;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left rtl:text-right", className)}
    >
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Role")}:</p>
        <RoleBadge role={user.role} />
      </div>
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Status")}:</p>
        <StatusBadge status={user.active} />
      </div>
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Email")}:</p>
        <a
          className="text-md font-semibold text-blue-400"
          href={`mailto:${user.email}`}
        >
          {user.email}
        </a>
      </div>
      <div className="flex space-x-5 text-foreground rtl:space-x-reverse">
        <p>{t("Phone Number")}:</p>
        <a
          style={{ direction: "ltr" }}
          className="text-md font-semibold text-blue-400"
          href={`tel:${user.phoneNumber}`}
        >
          {user.phoneNumber}
        </a>
      </div>
    </div>
  );
};

const Footer = ({
  t,
  isDesktop,
  user,
  userRole,
  Navigate,
}: {
  t: any;
  isDesktop: boolean;
  user: UserType;
  userRole: string | undefined;
  Navigate: any;
}) => {
  const footerContent =
    userRole !== MODERATOR ? (
      <>
        <Button onClick={() => Navigate(`/users/${user.id}`)}>
          <Pencil2Icon className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          <span>{t("Edit")}</span>
        </Button>
      </>
    ) : null;
  return isDesktop ? (
    <AlertDialogFooter className="gap-3">
      <div className="flex flex-row gap-3">{footerContent}</div>
      <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
    </AlertDialogFooter>
  ) : (
    <DrawerFooter>
      <div className="flex flex-col gap-3">{footerContent}</div>
      <DrawerClose asChild>
        <Button variant="outline">{t("Close")}</Button>
      </DrawerClose>
    </DrawerFooter>
  );
};

export default AvatarCombo;
