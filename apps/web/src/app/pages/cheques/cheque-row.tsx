import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { useTranslation } from "react-i18next";

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

import ChequeDetails from "./cheque-details";
import ChequeFormDialog from "./cheque-form-dialog";

type Props = {
  cheque: ChequeType;
  onDelete: (id: string) => void;
  userRole: string | undefined;
};

const ChequeRow = ({ cheque, onDelete, userRole }: Props) => {
  const { t, i18n } = useTranslation();
  const title = cheque.payee.name;
  const description = format(new Date(cheque.dueDate), DATE_FORMAT, {
    locale: i18n.resolvedLanguage === "ar" ? ar : enGB,
  });
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <ChequeDetails
          title={title}
          description={description}
          cheque={cheque}
          deleteCheque={onDelete}
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
            <div className="space-y-1 ltr:ml-4 rtl:mr-4">
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
        </ChequeDetails>
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
      <TableCell className="hidden text-right lg:table-cell print:hidden lg:print:hidden">
        {userRole !== SPECTATOR && (
          <div className="grid grid-cols-2">
            <ChequeFormDialog cheque={cheque}>
              <Button size="icon" variant="edit" aria-label="Edit">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Pencil2Icon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("Edit")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Button>
            </ChequeFormDialog>
            <DeleteDialog onAction={() => onDelete(cheque.id)}>
              <Button size="icon" variant="delete" aria-label="Delete">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TrashIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("Delete")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Button>
            </DeleteDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ChequeRow;
