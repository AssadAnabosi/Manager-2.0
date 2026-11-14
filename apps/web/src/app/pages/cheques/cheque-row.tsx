import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { usePermissions } from "@/hooks/use-permissions";

import { ChequeType } from "@/lib/types";

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
};

const ChequeRow = ({ cheque, onDelete }: Props) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { canWrite } = usePermissions();
  const title = cheque.payee.name;
  const description = fmt.date(new Date(cheque.dueDate));
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <ChequeDetails
          title={title}
          description={description}
          cheque={cheque}
          deleteCheque={onDelete}
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
            <div className="ms-4 space-y-1">
              <p
                className="text-sm leading-none font-medium"
                aria-label={t("Payee Name")}
              >
                {title}
              </p>
              <p
                className="text-muted-foreground text-sm"
                aria-label={t("Day and Date")}
              >
                {description}
              </p>
            </div>
          </div>
        </ChequeDetails>
      </TableCell>
      <TableCell
        dir="ltr"
        className={`rtl:text-right ${cheque.isCancelled ? "line-through" : ""}`}
      >
        {fmt.currency(cheque.value)}
      </TableCell>
      <TableCell
        className={`hidden md:table-cell ${
          cheque.isCancelled ? "line-through" : ""
        }`}
      >
        {cheque.remarks}
      </TableCell>
      <TableCell className="hidden text-right lg:table-cell print:hidden lg:print:hidden">
        {canWrite && (
          <div className="grid grid-cols-2">
            <ChequeFormDialog cheque={cheque}>
              <Button size="icon" variant="edit" aria-label={t("Edit")}>
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
              <Button size="icon" variant="delete" aria-label={t("Delete")}>
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
