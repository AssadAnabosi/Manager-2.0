import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

import StatusBadge from "@/components/component/status-badge";
import UserDetails from "./user-details";
import RoleBadge from "./role-badge";

import { AvatarIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { MODERATOR } from "@/lib/constants";

type Props = {
  user: UserType;
  userRole: string | undefined;
};

const UserRow = ({ user, userRole }: Props) => {
  const { t } = useTranslation();
  const title = user.fullName;
  const description = `@${user.username}`;
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <UserDetails title={user.fullName} user={user} userRole={userRole}>
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <AvatarIcon className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 ltr:ml-4 rtl:mr-4">
              <p
                className="text-sm font-medium leading-none"
                aria-label="Full Name"
              >
                {title}
              </p>
              <p
                style={{ direction: "ltr" }}
                className="text-sm text-muted-foreground"
                aria-label="Username"
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
        <StatusBadge status={user.active} />
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
          <p style={{ direction: "ltr" }} className="rtl:text-right">
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
        {userRole !== MODERATOR && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon" variant="edit" aria-label="Edit">
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
