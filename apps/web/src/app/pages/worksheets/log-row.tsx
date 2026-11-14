import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { LogType } from "@/lib/types";
import { DATE_FORMAT } from "@/lib/constants";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import DeleteDialog from "@/components/component/delete-dialog";
import LogDetails from "./log-details";
import LogFormDialog from "./log-form-dialog";
import StatusBadge from "@/components/component/status-badge";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter, numberFormatter } from "@/lib/utils";
import { USER, SPECTATOR } from "@/lib/constants";

type Props = {
  log: LogType;
  onDelete: (id: string) => void;
  userRole: string | undefined;
};

const LogRow = ({ log, onDelete, userRole }: Props) => {
  const { t, i18n } = useTranslation();
  const title = log.worker.fullName;
  const description = format(new Date(log.date), DATE_FORMAT, {
    locale: i18n.resolvedLanguage === "ar" ? ar : enGB,
  });
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <LogDetails
          title={title}
          description={description}
          log={log}
          deleteLog={onDelete}
          userRole={userRole}
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9 print:hidden">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <CalendarIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 ltr:ml-4 rtl:mr-4">
              <p
                className="text-sm font-medium leading-none"
                aria-label="Day and Date"
              >
                {title}
              </p>
              <p
                className="text-sm text-muted-foreground"
                aria-label="Day and Date"
              >
                {description}
              </p>
            </div>
          </div>
        </LogDetails>
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge status={!log.isAbsent} />
      </TableCell>
      <TableCell className="hidden md:table-cell print:table-cell">
        {log.startingTime} - {log.finishingTime} ({numberFormatter(log.OTV)})
      </TableCell>
      <TableCell className="hidden md:table-cell print:table-cell">
        <p style={{ direction: "ltr" }} className="rtl:text-right">
          {currencyFormatter(log.payment)}
        </p>
      </TableCell>
      <TableCell className="hidden lg:table-cell print:table-cell">
        {log.remarks}
      </TableCell>
      <TableCell className="hidden 2xl:table-cell print:hidden 2xl:print:hidden">
        {![USER, SPECTATOR].includes(userRole as string) && (
          <div className="grid grid-cols-2">
            <LogFormDialog log={log}>
              <Button size="icon" variant="edit" aria-label="Edit">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Pencil2Icon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("Edit")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Button>
            </LogFormDialog>
            <DeleteDialog onAction={() => onDelete(log.id)}>
              <Button size="icon" variant="delete" aria-label="Delete">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TrashIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("Delete")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Button>
            </DeleteDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default LogRow;
