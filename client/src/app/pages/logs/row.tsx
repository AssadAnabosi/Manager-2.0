import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { LogType } from "@/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AvatarCombo from "@/components/component/avatar-combo";
import DeleteDialog from "@/components/component/delete-dialog";

import ActionDropdownMenu from "./action-drop-down";
import EditDialog from "./form-dialog";

import {
  CalendarIcon,
  CheckIcon,
  Cross2Icon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import { currencyFormatter } from "@/lib/utils";

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
        ></AvatarCombo>
      </TableCell>
      <TableCell className="text-center">
        {log.isAbsent ? (
          <Badge
            variant="destructive"
            className="w-[65px] sm:w-[100%] sm:max-w-[65px] md:w-[65px] h-[20px]"
          >
            <Cross2Icon className="h-4 w-4 mx-auto" />
          </Badge>
        ) : (
          <Badge
            variant="success"
            className="w-[65px] sm:w-[100%] sm:max-w-[65px] md:w-[65px] h-[20px]"
          >
            <CheckIcon className="h-4 w-4 mx-auto" />
          </Badge>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {log.startingTime} - {log.finishingTime} ({log.OTV})
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {currencyFormatter(log.payment)}
      </TableCell>
      <TableCell className="hidden lg:table-cell">{log.remarks}</TableCell>
      <TableCell className="hidden md:table-cell 2xl:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="hidden 2xl:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(log.id)}>
          <Button variant="delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
