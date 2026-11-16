import { useAddDialog, useSearchParam } from "@/hooks/use-url-state";
import { useTranslation } from "react-i18next";

import { usePermissions } from "@/hooks/use-permissions";

import { UserType } from "@/lib/types";
import { useGetUsersQuery } from "@/api/users";

import { Button } from "@/components/ui/button";
import { ShortcutKey } from "@/components/component/shortcut-key";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/component/page-header";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";
import UserFormDialog from "./user-form-dialog";

import {
  TableSkeleton,
  type SkeletonColumn,
} from "@/components/component/table-skeleton";
import UserRow from "./user-row";

import { FilePlus } from "lucide-react";

const USERS_SKELETON: SkeletonColumn[] = [
  { kind: "identity" },
  { kind: "text", className: "hidden md:table-cell" },
  { kind: "badge", className: "hidden md:table-cell" },
  { kind: "badge", className: "hidden md:table-cell" },
  { kind: "lines", className: "hidden lg:table-cell" },
  { kind: "empty", className: "hidden lg:table-cell" },
];

const Users = () => {
  const { canCreateUsers } = usePermissions();
  const addDialog = useAddDialog(canCreateUsers);
  const { t } = useTranslation();
  const [search, setSearch] = useSearchParam("search");

  const { data: usersData, isLoading } = useGetUsersQuery();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <PageHeader title={t("Users")}>
        {canCreateUsers && (
          <UserFormDialog>
            <Button className="w-full">
              <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
<ShortcutKey>N</ShortcutKey>
            </Button>
          </UserFormDialog>
        )}
      </PageHeader>
      {canCreateUsers && (
        <UserFormDialog
          open={addDialog.open}
          onOpenChange={addDialog.setOpen}
        />
      )}
      <Separator />
      {/* FILTER */}
      <div className="flex flex-wrap justify-end">
        <div className="w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !usersData ? (
        <FetchError />
      ) : !isLoading && !usersData?.users?.length ? (
        <NoResults
          filterKeys={["search"]}
          action={
            canCreateUsers && (
              <UserFormDialog>
                <Button className="print:hidden">
                  <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
<ShortcutKey>N</ShortcutKey>
                </Button>
              </UserFormDialog>
            )
          }
        />
      ) : (
        <Table>
          <TableCaption>{t("A list of users")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px]">{t("Full Name")}</TableHead>
              <TableHead className="hidden w-[130px] text-center md:table-cell">
                {t("Role")}
              </TableHead>
              <TableHead className="hidden w-[110px] text-center md:table-cell">
                {t("Active")}
              </TableHead>
              <TableHead className="hidden w-[110px] text-center md:table-cell">
                {t("Loggable")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell">
                {t("Contact Details")}
              </TableHead>
              <TableHead className="hidden w-[60px] lg:table-cell"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={USERS_SKELETON} />
            ) : (
              usersData.users.map((user: UserType) => (
                <UserRow key={user.id} user={user} />
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Users;
