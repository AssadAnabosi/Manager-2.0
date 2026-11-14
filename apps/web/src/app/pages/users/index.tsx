import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/providers/auth-context";

import { UserType } from "@/lib/types";
import { useGetUsersQuery } from "@/api/users";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

import RowSkeleton from "./row-skeleton";
import UserRow from "./user-row";

import { FilePlus } from "lucide-react";

const Users = () => {
  const dummy = [...Array(8)];
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    search: "",
  });

  const search = searchParams.get("search") || "";
  const setSearch = (value: string) => {
    setSearchParams(
      (prev) => {
        prev.delete("search");
        if (value) prev.set("search", value);
        return prev;
      },
      { replace: true }
    );
  };

  const { data: usersData, isLoading } = useGetUsersQuery();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 space-y-2 md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">{t("Users")}</h2>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <UserFormDialog>
            <Button className="w-full">
              <FilePlus className="h-7 w-7 ltr:mr-2 rtl:ml-2" /> {t("Add New")}
            </Button>
          </UserFormDialog>
        </div>
      </div>
      <Separator />
      {/* FILTER */}
      <div className="flex flex-wrap justify-end">
        <div className=" w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !usersData ? (
        <FetchError />
      ) : !isLoading && !usersData?.users?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>{t("A list of users")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px] rtl:text-right">
                {t("Full Name")}
              </TableHead>
              <TableHead className="hidden w-[130px] text-center md:table-cell">
                {t("Role")}
              </TableHead>
              <TableHead className="hidden w-[80px] text-center md:table-cell">
                {t("Status")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell rtl:text-right">
                {t("Contact Details")}
              </TableHead>
              <TableHead className="hidden w-[60px] lg:table-cell"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : usersData.users.map((user: UserType) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    userRole={authUser?.role}
                  />
                ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Users;
