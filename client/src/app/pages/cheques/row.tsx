import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import i18next from "i18next";

import { ChequeType } from "@/lib/types";
import { currencyFormatter } from "@/lib/utils";
import { DATE_FORMAT, SPECTATOR } from "@/lib/constants";

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

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import AvatarCombo from "./avatar-combo";
import FormDialogDrawer from "./form-dialog-drawer";

const Row = (
  cheque: ChequeType,
  deleteCheque: any,
  userRole: string | undefined
) => {
  const title = cheque.payee.name;
  const description = format(new Date(cheque.dueDate), DATE_FORMAT, {
    locale: document.documentElement.lang === "ar" ? ar : enGB,
  });
  return (
    <TableRow key={cheque.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={title}
          description={description}
          cheque={cheque}
          deleteCheque={deleteCheque}
          userRole={userRole}
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="Avatar" />
              <AvatarFallback
                className={`${cheque.isCancelled ? "line-through" : ""}`}
              >
                {cheque.serial}
              </AvatarFallback>
            </Avatar>
            <div className="ltr:ml-4 rtl:mr-4 space-y-1">
              <p
                className="text-sm font-medium leading-none"
                aria-label="Payee Name"
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
      <TableCell className="print:hidden lg:print:hidden text-right hidden lg:table-cell">
        {userRole !== SPECTATOR && (
          <div className="grid grid-cols-2">
            <FormDialogDrawer cheque={cheque}>
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
            <DeleteDialog onAction={() => deleteCheque(cheque.id)}>
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
