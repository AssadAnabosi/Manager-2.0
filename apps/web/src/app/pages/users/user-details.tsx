import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";
import { useNavigate } from "react-router-dom";

import { UserType } from "@/lib/types";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/component/status-badge";

import { Pencil2Icon } from "@radix-ui/react-icons";

import RoleBadge from "./role-badge";

type Props = {
  children: ReactNode;
  title: string;
  user: UserType;
};

export default function UserDetails({
  children,
  title,
  user,
}: Props) {
  const { t } = useTranslation();
  const { canManageUsers } = usePermissions();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 text-start">
            <dt className="text-muted-foreground">{t("Role")}</dt>
            <dd>
              <RoleBadge role={user.role} />
            </dd>
            <dt className="text-muted-foreground">{t("Status")}</dt>
            <dd>
              <StatusBadge status={user.active} />
            </dd>
            <dt className="text-muted-foreground">{t("Email")}</dt>
            <dd>
              <a
                className="font-semibold text-blue-400"
                href={`mailto:${user.email}`}
              >
                {user.email}
              </a>
            </dd>
            <dt className="text-muted-foreground">{t("Phone Number")}</dt>
            <dd>
              <a
                dir="ltr"
                className="font-semibold text-blue-400"
                href={`tel:${user.phoneNumber}`}
              >
                {user.phoneNumber}
              </a>
            </dd>
          </dl>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          {canManageUsers && (
            <Button onClick={() => navigate(`/users/${user.id}`)}>
              <Pencil2Icon className="me-2 h-4 w-4" />
              <span>{t("Edit")}</span>
            </Button>
          )}
          <ResponsiveDialogClose asChild>
            <Button variant="outline">{t("Close")}</Button>
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
