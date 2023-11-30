import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { ChequeType } from "@/lib/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/component/delete-dialog";

import AvatarCombo from "./avatar-combo";
import ActionDropdownMenu from "./action-drop-down";
import FormDialog from "./form-dialog";

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
          cheque={cheque}
        ></AvatarCombo>
      </TableCell>
      <TableCell style={{ direction: "ltr" }} className="rtl:text-right">
        {currencyFormatter(cheque.value)}
      </TableCell>
      <TableCell className="hidden md:table-cell">{cheque.remarks}</TableCell>
      <TableCell className="text-right hidden md:table-cell lg:hidden">
        <ActionDropdownMenu cheque={cheque} />
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <FormDialog cheque={cheque}>
          <Button variant="edit" aria-label="Edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </FormDialog>
        <DeleteDialog onAction={() => console.log(cheque.id)}>
          <Button variant="delete" aria-label="Delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
