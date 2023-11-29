import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { LogType } from "@/lib/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/component/delete-dialog";

import AvatarCombo from "./avatar-combo";
import ActionDropdownMenu from "./action-drop-down";
import FormDialog from "./form-dialog";
import StatusBadge from "@/components/component/status-badge";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter, numberFormatter } from "@/lib/utils";

const Row = (log: LogType) => {
  return (
    <TableRow key={log.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={log.worker.fullName}
          description={format(new Date(log.date), "EEEE, dd/LL/y", {
            locale: document.documentElement.lang === "ar" ? ar : enGB,
          })}
          fallback={<CalendarIcon className="h-5 w-5" />}
          log={log}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge status={!log.isAbsent} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {log.startingTime} - {log.finishingTime} ({numberFormatter(log.OTV)})
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {currencyFormatter(log.payment)}
      </TableCell>
      <TableCell className="hidden lg:table-cell">{log.remarks}</TableCell>
      <TableCell className="hidden md:table-cell 2xl:hidden">
        <ActionDropdownMenu log={log} />
      </TableCell>
      <TableCell className="hidden 2xl:table-cell">
        <FormDialog log={log}>
          <Button variant="edit" aria-label="Edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </FormDialog>
        <DeleteDialog onAction={() => console.log(log.id)}>
          <Button variant="delete" aria-label="Delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
