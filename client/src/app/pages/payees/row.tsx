import { PayeeType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { PersonIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import AvatarCombo from "@/components/component/avatar-combo";
import ActionDropdownMenu from "./action-drop-down";
import EditDialog from "./form-dialog";
import DeleteDialog from "@/components/component/delete-dialog";

const Row = (payee: PayeeType) => {
  return (
    <TableRow key={payee.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={payee.name}
          fallback={<PersonIcon className="h-5 w-5" />}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              className="font-bold hover:cursor-pointer"
              href={`mailto:${payee.email}`}
            >
              {payee.email}
            </a>
          </p>
          <p>
            <a
              className="text-muted-foreground hover:cursor-pointer"
              href={`tel:${payee.phoneNumber}`}
            >
              {payee.phoneNumber}
            </a>
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">{payee.remarks}</TableCell>
      <TableCell className="w-max text-right lg:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="w-max text-right hidden lg:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(payee.id)}>
          <Button variant="delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
