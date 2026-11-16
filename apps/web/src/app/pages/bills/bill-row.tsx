import { BillType } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { usePermissions } from "@/hooks/use-permissions";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TooltipButton from "@/components/component/tooltip-button";
import DeleteDialog from "@/components/component/delete-dialog";

import BillDetails from "./bill-details";
import BillFormDialog from "./bill-form-dialog";

import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { billKindColor, billKindLabel } from "./kind";

type Props = {
  bill: BillType;
  onDelete: (id: string) => void;
};

const BillRow = ({ bill, onDelete }: Props) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { canWrite } = usePermissions();
  const title = fmt.date(new Date(bill.date), "EEEE");
  const description = fmt.date(new Date(bill.date), "dd/LL/y");
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <BillDetails
          title={title}
          description={description}
          bill={bill}
          deleteBill={onDelete}
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9 print:hidden">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <CalendarIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="ms-4 space-y-1">
              <p
                className="text-sm leading-none font-medium"
                aria-label={t("Day")}
              >
                {title}
              </p>
              <p
                className="text-muted-foreground text-sm"
                aria-label={t("Date")}
              >
                {description}
              </p>
            </div>
          </div>
        </BillDetails>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={cn("font-medium", billKindColor(bill.type))}
            aria-label={t("Amount")}
          >
            <bdi dir="ltr">{fmt.signedCurrency(bill.type, bill.amount)}</bdi>
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
      <TableCell className="hidden text-end lg:table-cell print:hidden lg:print:hidden">
        {canWrite && (
          <div className="grid grid-cols-2">
            <BillFormDialog bill={bill}>
              <TooltipButton size="icon" variant="edit" label={t("Edit")}>
                <Pencil2Icon />
              </TooltipButton>
            </BillFormDialog>
            <DeleteDialog onAction={() => onDelete(bill.id)}>
              <TooltipButton size="icon" variant="delete" label={t("Delete")}>
                <TrashIcon />
              </TooltipButton>
            </DeleteDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default BillRow;
