import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { BillType } from "@/lib/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/component/delete-dialog";

import AvatarCombo from "./avatar-combo";
import FormDialog from "./form-dialog";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter } from "@/lib/utils";
import { SPECTATOR } from "@/lib/constants";

const Row = (bill: BillType, deleteBill: any, userRole: string | undefined) => {
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
          bill={bill}
          deleteBill={deleteBill}
          userRole={userRole}
        ></AvatarCombo>
      </TableCell>
      <TableCell style={{ direction: "ltr" }} className="rtl:text-right">
        {currencyFormatter(bill.value)}
      </TableCell>
      <TableCell className="print:table-cell hidden md:table-cell">
        {bill.description}
      </TableCell>
      <TableCell className="print:table-cell hidden lg:table-cell">
        {bill.remarks}
      </TableCell>
      <TableCell className="print:hidden lg:print:hidden text-right hidden lg:table-cell">
        {userRole !== SPECTATOR && (
          <div className="grid grid-cols-2">
            <FormDialog bill={bill}>
              <Button size="icon" variant="edit" aria-label="Edit">
                <Pencil2Icon />
              </Button>
            </FormDialog>
            <DeleteDialog onAction={() => deleteBill(bill.id)}>
              <Button size="icon" variant="delete" aria-label="Delete">
                <TrashIcon />
              </Button>
            </DeleteDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default Row;
