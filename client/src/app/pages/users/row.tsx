import { Link } from "react-router-dom";
import i18next from "i18next";

import { UserType } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import StatusBadge from "@/components/component/status-badge";
import AvatarCombo from "./avatar-combo";
import RoleBadge from "./role-badge";

import { AvatarIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { MODERATOR } from "@/lib/constants";

const Row = (user: UserType, userRole: string | undefined) => {
  return (
    <TableRow key={user.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={user.fullName}
          description={`@${user.username}`}
          fallback={<AvatarIcon className="h-7 w-7" />}
          user={user}
          userRole={userRole}
        ></AvatarCombo>
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
              className="text-blue-400 font-bold hover:cursor-pointer"
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
      <TableCell className="w-max text-right hidden lg:table-cell">
        {userRole !== MODERATOR && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button asChild size="icon" variant="edit" aria-label="Edit">
                  <Link to={`/users/${user.id}`}>
                    <Pencil2Icon />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{i18next.t("Edit")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};

export default Row;
