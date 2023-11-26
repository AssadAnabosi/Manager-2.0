import { PayeeType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { PersonIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import DeleteDialog from "@/components/component/delete-dialog";

import AvatarCombo from "./avatar-combo";
import ActionDropdownMenu from "./action-drop-down";
import FormDialog from "./form-dialog";

const Row = (payee: PayeeType) => {
  return (
    <TableRow key={payee.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={payee.name}
          fallback={<PersonIcon className="h-5 w-5" />}
          payee={payee}
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
          <p style={{ direction: "ltr" }} className="rtl:text-right">
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
      <TableCell className="w-max text-right rtl:text-left lg:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="w-max ltr:text-right rtl:text-left hidden lg:table-cell">
        <FormDialog>
          <Button variant="edit" aria-label="Edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </FormDialog>
        <DeleteDialog onAction={() => console.log(payee.id)}>
          <Button variant="delete" aria-label="Delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
