import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserType } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "@/components/component/status-badge";

import RoleBadge from "./role-badge";

import { Pencil2Icon } from "@radix-ui/react-icons";
import { MODERATOR } from "@/lib/constants";

const AvatarCombo = ({
  fallback,
  title,
  description,
  user,
  userRole,
}: {
  fallback: React.ReactNode | string;
  title: string;
  description?: string | JSX.Element;
  user: UserType;
  userRole: string | undefined;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const Navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage alt="Avatar" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="ltr:ml-4 rtl:mr-4 space-y-1">
            <p
              className="text-sm font-medium leading-none"
              aria-label="Full Name"
            >
              {title}
            </p>
            <p className="text-sm text-muted-foreground" aria-label="Username">
              {description}
            </p>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="space-x-3 rtl:space-x-reverse">
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-left rtl:text-right">
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
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          {userRole !== MODERATOR && (
            <div className="flex flex-col gap-3 md:flex-row">
              <Button onClick={() => Navigate(`/users/${user.id}`)}>
                <Pencil2Icon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                <span>{t("Edit")}</span>
              </Button>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarCombo;
