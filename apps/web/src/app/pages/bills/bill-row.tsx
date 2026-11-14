import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { BillType } from "@/lib/types";
import { useTranslation } from "react-i18next";

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

import BillDetails from "./bill-details";
import BillFormDialog from "./bill-form-dialog";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { cn, signedCurrencyFormatter } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { billKindColor, billKindLabel } from "./kind";
import { SPECTATOR } from "@/lib/constants";

type Props = {
  bill: BillType;
  onDelete: (id: string) => void;
  userRole: string | undefined;
};

const BillRow = ({ bill, onDelete, userRole }: Props) => {
  const { t, i18n } = useTranslation();
  const title = format(new Date(bill.date), "EEEE", {
    locale: i18n.resolvedLanguage === "ar" ? ar : enGB,
  });
  const description = format(new Date(bill.date), "dd/LL/y", {
    locale: i18n.resolvedLanguage === "ar" ? ar : enGB,
  });
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <BillDetails
          title={title}
          description={description}
          bill={bill}
          deleteBill={onDelete}
          userRole={userRole}
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9 print:hidden">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <CalendarIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 ltr:ml-4 rtl:mr-4">
              <p className="text-sm font-medium leading-none" aria-label="Day">
                {title}
              </p>
              <p className="text-sm text-muted-foreground" aria-label="Date">
                {description}
              </p>
            </div>
          </div>
        </BillDetails>
      </TableCell>
      <TableCell style={{ direction: "ltr" }} className="rtl:text-right">
        <div className="flex items-center gap-2 rtl:flex-row-reverse rtl:justify-end">
          <span
            className={cn("font-medium", billKindColor(bill.type))}
            aria-label="Amount"
          >
            {signedCurrencyFormatter(bill.type, bill.amount)}
          </span>
          <Badge
            variant="outline"
            className={cn("print:hidden", billKindColor(bill.type))}
          >
            {t(billKindLabel(bill.type))}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell print:table-cell">
        {bill.description}
      </TableCell>
      <TableCell className="hidden lg:table-cell print:table-cell">
        {bill.remarks}
      </TableCell>
      <TableCell className="hidden text-right lg:table-cell print:hidden lg:print:hidden">
        {userRole !== SPECTATOR && (
          <div className="grid grid-cols-2">
            <BillFormDialog bill={bill}>
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
            </BillFormDialog>
            <DeleteDialog onAction={() => onDelete(bill.id)}>
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

export default BillRow;
