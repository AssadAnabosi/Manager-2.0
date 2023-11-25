import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { BillType } from "@/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AvatarCombo from "@/components/component/avatar-combo";
import DeleteDialog from "@/components/component/delete-dialog";

import ActionDropdownMenu from "./action-drop-down";
import EditDialog from "./form-dialog";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter } from "@/lib/utils";

const Row = (bill: BillType) => {
  return (
    <TableRow key={bill.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={format(new Date(bill.date), "EEEE", {
            locale: document.documentElement.lang === "ar" ? ar : enGB,
          })}
          description={format(new Date(bill.date), "dd/LL/y", {
            locale: document.documentElement.lang === "ar" ? ar : enGB,
          })}
          fallback={<CalendarIcon className="h-5 w-5" />}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="table-cell">
        {currencyFormatter(bill.value)}
      </TableCell>
      <TableCell className="hidden md:table-cell">{bill.description}</TableCell>
      <TableCell className="hidden lg:table-cell">{bill.remarks}</TableCell>
      <TableCell className="text-right hidden md:table-cell lg:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(bill.id)}>
          <Button variant="delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
