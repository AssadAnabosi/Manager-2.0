import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";

import { ChequeType } from "@/lib/types";
import { DATE_FORMAT } from "@/lib/constants";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/component/delete-dialog";

import AvatarCombo from "./avatar-combo";
import FormDialog from "./form-dialog";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter } from "@/lib/utils";

const Row = (cheque: ChequeType, deleteCheque: any) => {
  return (
    <TableRow key={cheque.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={cheque.payee.name}
          description={format(new Date(cheque.dueDate), DATE_FORMAT, {
            locale: document.documentElement.lang === "ar" ? ar : enGB,
          })}
          fallback={cheque.serial}
          cheque={cheque}
          deleteCheque={deleteCheque}
        ></AvatarCombo>
      </TableCell>
      <TableCell
        style={{ direction: "ltr" }}
        className={`rtl:text-right ${cheque.isCancelled ? "line-through" : ""}`}
      >
        {currencyFormatter(cheque.value)}
      </TableCell>
      <TableCell
        className={`hidden md:table-cell ${
          cheque.isCancelled ? "line-through" : ""
        }`}
      >
        {cheque.remarks}
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <FormDialog cheque={cheque}>
          <Button size="icon" variant="edit" aria-label="Edit">
            <Pencil2Icon />
          </Button>
        </FormDialog>
        <DeleteDialog onAction={() => deleteCheque(cheque.id)}>
          <Button size="icon" variant="delete" aria-label="Delete">
            <TrashIcon />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
