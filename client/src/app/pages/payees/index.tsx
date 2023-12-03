import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useQuery } from "@tanstack/react-query";

import useAxios from "@/hooks/use-axios";

import { PayeeType } from "@/lib/types";

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

import RowSkeleton from "./row-skeleton";
import Row from "./row";

const Payees = () => {
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
  const { data: payeesData, isLoading } = useQuery({
    queryKey: ["payees", { search }],
    queryFn: async () => {
      const { data: response } = await axios.get("/payees", {
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
        <h2 className="text-3xl font-bold tracking-tight">{t("Payees")}</h2>
      </div>
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <div className=" w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !payeesData ? (
        <FetchError />
      ) : !isLoading && !payeesData?.payees?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>{t("A list of payees")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px] rtl:text-right">
                {t("Payee Name")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-[300px] rtl:text-right">
                {t("Contact Details")}
              </TableHead>
              <TableHead className="hidden lg:table-cell w-max rtl:text-right">
                {t("Remarks")}
              </TableHead>
              <TableHead className="w-[130px] hidden lg:table-cell"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : payeesData.payees.map((payee: PayeeType) => Row(payee))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Payees;
