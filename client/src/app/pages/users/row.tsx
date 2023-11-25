// import { useTranslation } from "react-i18next";
import { UserType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AvatarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import AvatarCombo from "@/components/component/avatar-combo";
import ActionDropdownMenu from "./action-drop-down";
import EditDialog from "./form-dialog";
import DeleteDialog from "@/components/component/delete-dialog";

const Row = (user: UserType) => {
  // const { t } = useTranslation();
  return (
    <TableRow key={user.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={user.fullName}
          description={`@${user.username}`}
          fallback={<AvatarIcon className="h-7 w-7" />}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="text-center hidden md:table-cell">
        {/* <Badge className="inline-block h-[25px] w-full">{t(user.role)}</Badge> */}
        <Badge className="inline-block h-[25px] w-full">{user.role}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col space-y-1">
          <p>
            <a
              className="font-bold hover:cursor-pointer"
              href={`mailto:${user.email}`}
            >
              {user.email}
            </a>
          </p>
          <p>
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
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="w-max text-right hidden lg:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(user.id)}>
          <Button variant="delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

export default Row;
