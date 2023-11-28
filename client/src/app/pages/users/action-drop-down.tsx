import { UserType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DotsHorizontalIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import FormDialog from "./form-dialog";
import DeleteDialog from "@/components/component/delete-dialog";

export default function ActionDropdownMenu({ user }: { user: UserType }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="More">
          <DotsHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <FormDialog user={user}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil2Icon className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          </FormDialog>
          <DeleteDialog onAction={() => console.log("123")}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DeleteDialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
