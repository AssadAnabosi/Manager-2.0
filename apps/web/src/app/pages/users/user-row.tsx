import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";

import { UserType } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import StateBadge from "@/components/component/state-badge";
import UserDetails from "./user-details";
import RoleBadge from "./role-badge";

import { AvatarIcon, Pencil2Icon } from "@radix-ui/react-icons";

type Props = {
  user: UserType;
};

const UserRow = ({ user }: Props) => {
  const { t } = useTranslation();
  const { canManageUsers } = usePermissions();
  const title = user.fullName;
  const description = `@${user.username}`;
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <UserDetails title={user.fullName} user={user}>
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <AvatarIcon className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
            <div className="ms-4 space-y-1">
              <p
                className="text-sm leading-none font-medium"
                aria-label={t("Full Name")}
              >
                {title}
              </p>
              <p
                dir="ltr"
                className="text-muted-foreground text-sm"
                aria-label={t("Username")}
              >
                {description}
              </p>
            </div>
          </div>
        </UserDetails>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <StateBadge
          on={user.active}
          labels={[t("Active"), t("Deactivated")]}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <StateBadge
          on={user.loggable}
          labels={[t("Loggable"), t("Not loggable")]}
          offTone="muted"
        />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              className="font-bold text-blue-400 hover:cursor-pointer"
              href={`mailto:${user.email}`}
            >
              {user.email}
            </a>
          </p>
          <p dir="ltr" className="rtl:text-right">
            <a
              className="text-blue-400 hover:cursor-pointer"
              href={`tel:${user.phoneNumber}`}
            >
              {user.phoneNumber}
            </a>
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden w-max text-right lg:table-cell">
        {canManageUsers && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="icon"
                  variant="edit"
                  aria-label={t("Edit")}
                >
                  <Link to={`/users/${user.id}`}>
                    <Pencil2Icon />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Edit")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
