import i18next from "i18next";
import { PayeeType } from "@/lib/types";

import { TableCell, TableRow } from "@/components/ui/table";
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

import AvatarCombo from "./avatar-combo";
import FormDialog from "./form-dialog";
import { MODERATOR } from "@/lib/constants";

const Row = (
  payee: PayeeType,
  deletePayee: any,
  userRole: string | undefined
) => {
  return (
    <TableRow key={payee.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={payee.name}
          fallback={<User className="h-5 w-5" />}
          payee={payee}
          deletePayee={deletePayee}
          userRole={userRole}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              aria-label="Email"
              className="text-blue-500 font-bold hover:cursor-pointer"
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
      <TableCell className="w-max text-right hidden lg:table-cell">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FormDialog payee={payee}>
                <Button size="icon" variant="edit" aria-label="Edit">
                  <Pencil2Icon />
                </Button>
              </FormDialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18next.t("Edit")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {userRole !== MODERATOR && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DeleteDialog onAction={() => deletePayee(payee.id)}>
                  <Button size="icon" variant="delete" aria-label="Delete">
                    <TrashIcon />
                  </Button>
                </DeleteDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>{i18next.t("Delete")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};

export default Row;
