import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";
import { PayeeType } from "@/lib/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { User } from "lucide-react";
import DeleteDialog from "@/components/component/delete-dialog";

import PayeeDetails from "./payee-details";
import PayeeFormDialog from "./payee-form-dialog";

type Props = {
  payee: PayeeType;
  onDelete: (id: string) => void;
};

const PayeeRow = ({ payee, onDelete }: Props) => {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const title = payee.name;
  return (
    <TableRow className="h-[73px]">
      <TableCell>
        <PayeeDetails title={title} payee={payee} deletePayee={onDelete}>
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 ltr:ml-4 rtl:mr-4">
              <p className="text-sm font-medium leading-none">{title}</p>
            </div>
          </div>
        </PayeeDetails>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              aria-label="Email"
              className="font-bold text-blue-500 hover:cursor-pointer"
              href={`mailto:${payee.email}`}
            >
              {payee.email}
            </a>
          </p>
          <p style={{ direction: "ltr" }} className="rtl:text-right">
            <a
              aria-label="Email"
              className="text-blue-500 hover:cursor-pointer"
              href={`tel:${payee.phoneNumber}`}
            >
              {payee.phoneNumber}
            </a>
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">{payee.remarks}</TableCell>
      <TableCell className="hidden w-max text-right lg:table-cell">
        {canWrite && (
          <>
            <PayeeFormDialog payee={payee}>
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
            </PayeeFormDialog>
            <DeleteDialog onAction={() => onDelete(payee.id)}>
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
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PayeeRow;
