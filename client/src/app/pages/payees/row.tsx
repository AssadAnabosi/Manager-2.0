import i18next from "i18next";
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

import AvatarCombo from "./avatar-combo";
import FormDialogDrawer from "./form-dialog-drawer";
import { MODERATOR } from "@/lib/constants";

const Row = (
  payee: PayeeType,
  deletePayee: any,
  userRole: string | undefined
) => {
  const title = payee.name;
  return (
    <TableRow key={payee.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={title}
          payee={payee}
          deletePayee={deletePayee}
          userRole={userRole}
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="Avatar" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="ltr:ml-4 rtl:mr-4 space-y-1">
              <p className="text-sm font-medium leading-none">{title}</p>
            </div>
          </div>
        </AvatarCombo>
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
        <FormDialogDrawer payee={payee}>
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
        {userRole !== MODERATOR && (
          <DeleteDialog onAction={() => deletePayee(payee.id)}>
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
        )}
      </TableCell>
    </TableRow>
  );
};

export default Row;
