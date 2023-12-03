import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { UserType } from "@/lib/types";

import useAxios from "@/hooks/use-axios";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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

import RowSkeleton from "./row-skeleton";
import Row from "./row";

import { DownloadIcon } from "@radix-ui/react-icons";

const Users = () => {
  const dummy = [...Array(8)];
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
  const axios = useAxios();
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: async () => {
      const { data: response } = await axios.get("/users", {
        params: {
          search,
        },
      });
      return response.data;
    },
  });
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">{t("Users")}</h2>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="hidden md:inline-block">
            <Button>
              <DownloadIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />{" "}
              {t("Download")}
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <div className=" w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !usersData.users.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>{t("A list of users")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px] rtl:text-right">
                {t("Full Name")}
              </TableHead>
              <TableHead className="w-[130px] text-center hidden md:table-cell">
                {t("Role")}
              </TableHead>
              <TableHead className="w-[80px] text-center hidden md:table-cell">
                {t("Status")}
              </TableHead>
              <TableHead className="w-max hidden lg:table-cell rtl:text-right">
                {t("Contact Details")}
              </TableHead>
              <TableHead className="w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : usersData.users.map((user: UserType) => Row(user))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Users;
