import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { BillType } from "@/lib/types";
import i18next from "i18next";

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

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { currencyFormatter } from "@/lib/utils";
import { SPECTATOR } from "@/lib/constants";

const Row = (bill: BillType, deleteBill: any, userRole: string | undefined) => {
  const title = format(new Date(bill.date), "EEEE", {
    locale: document.documentElement.lang === "ar" ? ar : enGB,
  });
  const description = format(new Date(bill.date), "dd/LL/y", {
    locale: document.documentElement.lang === "ar" ? ar : enGB,
  });
  return (
    <TableRow key={bill.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={title}
          description={description}
          bill={bill}
          deleteBill={deleteBill}
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
              <p className="text-sm font-medium leading-none" aria-label="Day">
                {title}
              </p>
              <p className="text-sm text-muted-foreground" aria-label="Date">
                {description}
              </p>
            </div>
          </div>
        </AvatarCombo>
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
            <FormDialogDrawer bill={bill}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="edit" aria-label="Edit">
                      <Pencil2Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{i18next.t("Edit")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormDialogDrawer>
            <DeleteDialog onAction={() => deleteBill(bill.id)}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="delete" aria-label="Delete">
                      <TrashIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{i18next.t("Delete")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DeleteDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default Row;
