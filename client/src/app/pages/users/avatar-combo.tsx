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

  const isDesktop = useMediaQuery("(min-width: 768px)");
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
        <DrawerHeader className="text-left rtl:text-right pt-6">
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
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Role")}:</p>
        <RoleBadge role={user.role} />
      </div>
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Status")}:</p>
        <StatusBadge status={user.active} />
      </div>
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Email")}:</p>
        <a
          className="text-blue-400 text-md font-semibold"
          href={`mailto:${user.email}`}
        >
          {user.email}
        </a>
      </div>
      <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
        <p>{t("Phone Number")}:</p>
        <a
          style={{ direction: "ltr" }}
          className="text-blue-400 text-md font-semibold"
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
      <div className="flex flex-col gap-3 md:flex-row">
        <Button onClick={() => Navigate(`/users/${user.id}`)}>
          <Pencil2Icon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          <span>{t("Edit")}</span>
        </Button>
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
