import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { usePermissions } from "@/hooks/use-permissions";

import { LogType } from "@/lib/types";

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

type Props = {
  log: LogType;
  onDelete: (id: string) => void;
};

const LogRow = ({ log, onDelete }: Props) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { canWrite } = usePermissions();
  const title = log.worker.fullName;
  const description = fmt.date(new Date(log.date));
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <LogDetails
          title={title}
          description={description}
          log={log}
          deleteLog={onDelete}
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9 print:hidden">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <CalendarIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="ms-4 space-y-1">
              <p
                className="text-sm leading-none font-medium"
                aria-label={t("Day and Date")}
              >
                {title}
              </p>
              <p
                className="text-muted-foreground text-sm"
                aria-label={t("Day and Date")}
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
        {log.startingTime} - {log.finishingTime} ({fmt.number(log.OTV)})
      </TableCell>
      <TableCell className="hidden md:table-cell print:table-cell">
        <p dir="ltr" className="rtl:text-right">
          {fmt.currency(log.payment)}
        </p>
      </TableCell>
      <TableCell className="hidden lg:table-cell print:table-cell">
        {log.remarks}
      </TableCell>
      <TableCell className="hidden 2xl:table-cell print:hidden 2xl:print:hidden">
        {canWrite && (
          <div className="grid grid-cols-2">
            <LogFormDialog log={log}>
              <Button size="icon" variant="edit" aria-label={t("Edit")}>
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
              <Button size="icon" variant="delete" aria-label={t("Delete")}>
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
