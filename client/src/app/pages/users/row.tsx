import { UserType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/component/delete-dialog";
import StatusBadge from "@/components/component/status-badge";

import AvatarCombo from "./avatar-combo";
import ActionDropdownMenu from "./action-drop-down";
import FormDialog from "./form-dialog";
import RoleBadge from "./role-badge";

import { AvatarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

const Row = (user: UserType) => {
  return (
    <TableRow key={user.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={user.fullName}
          description={`@${user.username}`}
          fallback={<AvatarIcon className="h-7 w-7" />}
          user={user}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <StatusBadge status={user.active} />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              className="font-bold hover:cursor-pointer"
              href={`mailto:${user.email}`}
            >
              {user.email}
            </a>
          </p>
          <p style={{ direction: "ltr" }} className="rtl:text-right">
            <a
              className="text-muted-foreground hover:cursor-pointer"
              href={`tel:${user.phoneNumber}`}
            >
              {user.phoneNumber}
            </a>
          </p>
        </div>
      </TableCell>
      <TableCell className="w-max text-right lg:hidden">
        <ActionDropdownMenu user={user} />
      </TableCell>
      <TableCell className="w-max text-right hidden lg:table-cell">
        <FormDialog user={user}>
          <Button variant="edit" aria-label="Edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </FormDialog>
        <DeleteDialog onAction={() => console.log(user.id)}>
          <Button variant="delete" aria-label="Delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
