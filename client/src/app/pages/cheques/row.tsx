import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { ChequeType } from "@/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AvatarCombo from "@/components/component/avatar-combo";
import DeleteDialog from "@/components/component/delete-dialog";

import ActionDropdownMenu from "./action-drop-down";
import EditDialog from "./form-dialog";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter } from "@/lib/utils";

const Row = (cheque: ChequeType) => {
  return (
    <TableRow key={cheque.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={cheque.payee.name}
          description={format(new Date(cheque.dueDate), "EEEE, dd/LL/y", {
            locale: document.documentElement.lang === "ar" ? ar : enGB,
          })}
          fallback={cheque.serial}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="table-cell">
        {currencyFormatter(cheque.value)}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {cheque.description}
      </TableCell>
      <TableCell className="text-right hidden md:table-cell lg:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(cheque.id)}>
          <Button variant="delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
