import { useState } from "react";
import AvatarCombo from "@/components/component/avatar-combo";
import { AvatarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserType } from "@/types";

import usersData from "@/data/users.json";
import Searchbox from "@/components/component/searchbox";

import NoResults from "@/components/component/no-results";
import DeleteDialog from "@/components/component/delete-dialog";
import EditDialog from "./form-dialog";
import ActionDropdownMenu from "./action-drop-down";

const Users = () => {
  // usersData.users=[];
  const dummy = [...Array(15)];
  const [search, setSearch] = useState("");

  // set is loading to true for 1500ms
  const [isLoading, setIsLoading] = useState(true);
  setTimeout(() => {
    setIsLoading(false);
  }, 1500);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center space-x-2">
          <div className="hidden md:inline-block">
            <Button>
              <DownloadIcon className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <div className=" w-[100%] md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !usersData.users.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption> A list of users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px]">User</TableHead>
              <TableHead className="w-[130px] text-center hidden md:table-cell">
                Role
              </TableHead>
              <TableHead className="w-max hidden md:table-cell">
                Contact Details
              </TableHead>
              <TableHead className="w-[60px] lg:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => SkeletonRow(index))
              : usersData.users.map((user) => InsertUser(user))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Users;

const InsertUser = (user: UserType) => {
  return (
    <TableRow key={user.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={user.fullName}
          description={`@${user.username}`}
          fallback={<AvatarIcon className="h-7 w-7" />}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="text-center">
        <Badge className="hidden md:inline-block h-[25px] w-[100%]">
          {user.role}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col space-y-1">
          <a
            className="font-bold hover:cursor-pointer"
            href={`mailto:${user.email}`}
          >
            {user.email}
          </a>
          <a
            className="text-muted-foreground hover:cursor-pointer"
            href={`tel:${user.phoneNumber}`}
          >
            {user.phoneNumber}
          </a>
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

const SkeletonRow = (index: number) => {
  return (
    <TableRow key={index} className="h-[73px]">
      <TableCell>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-[14px] w-[120px] leading-none " />
            <Skeleton className="h-[20px] w-[100px] " />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="hidden md:inline-block h-[25px] w-[100%] rounded-full" />
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-[20px] w-[190px] leading-none " />
          <Skeleton className="h-[20px] w-[120px] " />
        </div>
      </TableCell>
    </TableRow>
  );
};
