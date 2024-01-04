import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import i18next from "i18next";

import { LogType } from "@/lib/types";
import { DATE_FORMAT } from "@/lib/constants";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import DeleteDialog from "@/components/component/delete-dialog";
import AvatarCombo from "./avatar-combo";
import FormDialog from "./form-dialog";
import StatusBadge from "@/components/component/status-badge";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter, numberFormatter } from "@/lib/utils";
import { USER, SPECTATOR } from "@/lib/constants";

const Row = (log: LogType, deleteLog: any, userRole: string | undefined) => {
  return (
    <TableRow key={log.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={log.worker.fullName}
          description={format(new Date(log.date), DATE_FORMAT, {
            locale: document.documentElement.lang === "ar" ? ar : enGB,
          })}
          fallback={<CalendarIcon className="h-5 w-5" />}
          log={log}
          deleteLog={deleteLog}
          userRole={userRole}
        ></AvatarCombo>
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
                <TooltipTrigger>
                  <FormDialog log={log}>
                    <Button size="icon" variant="edit" aria-label="Edit">
                      <Pencil2Icon />
                    </Button>
                  </FormDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{i18next.t("Edit")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
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
