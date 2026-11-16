import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";
import { PayeeType } from "@/lib/types";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TooltipButton from "@/components/component/tooltip-button";

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
            <div className="ms-4 space-y-1">
              <p className="text-sm leading-none font-medium">{title}</p>
            </div>
          </div>
        </PayeeDetails>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              aria-label={t("Email")}
              className="font-bold text-blue-500 hover:cursor-pointer"
              href={`mailto:${payee.email}`}
            >
              {payee.email}
            </a>
          </p>
          <p>
            <a
              aria-label={t("Phone Number")}
              className="text-blue-500 hover:cursor-pointer"
              href={`tel:${payee.phoneNumber}`}
            >
              <bdi dir="ltr">{payee.phoneNumber}</bdi>
            </a>
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">{payee.remarks}</TableCell>
      <TableCell className="hidden w-max text-end lg:table-cell">
        {canWrite && (
          <>
            <PayeeFormDialog payee={payee}>
              <TooltipButton size="icon" variant="edit" label={t("Edit")}>
                <Pencil2Icon />
              </TooltipButton>
            </PayeeFormDialog>
            <DeleteDialog onAction={() => onDelete(payee.id)}>
              <TooltipButton size="icon" variant="delete" label={t("Delete")}>
                <TrashIcon />
              </TooltipButton>
            </DeleteDialog>
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PayeeRow;
