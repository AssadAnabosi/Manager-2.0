import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import i18next from "i18next";

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
import AvatarCombo from "./avatar-combo";
import FormDialogDrawer from "./form-dialog-drawer";
import StatusBadge from "@/components/component/status-badge";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter, numberFormatter } from "@/lib/utils";
import { USER, SPECTATOR } from "@/lib/constants";

const Row = (log: LogType, deleteLog: any, userRole: string | undefined) => {
  const title = log.worker.fullName;
  const description = format(new Date(log.date), DATE_FORMAT, {
    locale: document.documentElement.lang === "ar" ? ar : enGB,
  });
  return (
    <TableRow key={log.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={title}
          description={description}
          log={log}
          deleteLog={deleteLog}
          userRole={userRole}
        >
          <div className="flex items-center">
            <Avatar className="print:hidden h-9 w-9">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <CalendarIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="ltr:ml-4 rtl:mr-4 space-y-1">
              <p
                className="text-sm font-medium leading-none"
                ria-label="Day and Date"
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
        </AvatarCombo>
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge status={!log.isAbsent} />
      </TableCell>
      <TableCell className="print:table-cell hidden md:table-cell">
        {log.startingTime} - {log.finishingTime} ({numberFormatter(log.OTV)})
      </TableCell>
      <TableCell className="print:table-cell hidden md:table-cell">
        <p style={{ direction: "ltr" }} className="rtl:text-right">
          {currencyFormatter(log.payment)}
        </p>
      </TableCell>
      <TableCell className="print:table-cell hidden lg:table-cell">
        {log.remarks}
      </TableCell>
      <TableCell className="print:hidden hidden 2xl:table-cell 2xl:print:hidden">
        {![USER, SPECTATOR].includes(userRole as string) && (
          <div className="grid grid-cols-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FormDialogDrawer log={log}>
                    <Button size="icon" variant="edit" aria-label="Edit">
                      <Pencil2Icon />
                    </Button>
                  </FormDialogDrawer>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{i18next.t("Edit")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DeleteDialog onAction={() => deleteLog(log.id)}>
                    <Button size="icon" variant="delete" aria-label="Delete">
                      <TrashIcon />
                    </Button>
                  </DeleteDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{i18next.t("Delete")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default Row;
