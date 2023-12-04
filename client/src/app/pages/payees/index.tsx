import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PayeeType } from "@/lib/types";

import { useGetPayeesQuery, useDeletePayeeMutation } from "@/api/payees";

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
import FormDialog from "./form-dialog";

import RowSkeleton from "./row-skeleton";
import Row from "./row";

import { FilePlusIcon } from "lucide-react";

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

  const { data: payeesData, isLoading } = useGetPayeesQuery();
  const { mutate: deletePayee } = useDeletePayeeMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">{t("Payees")}</h2>
        <div className="flex items-center gap-2 flex-col md:flex-row">
          <FormDialog>
            <Button className="w-full">
              <FilePlusIcon className="ltr:mr-2 rtl:ml-2 h-7 w-7" />{" "}
              {t("Add New")}
            </Button>
          </FormDialog>
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
              <TableHead className="w-[120px] hidden lg:table-cell"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : payeesData.payees.map((payee: PayeeType) =>
                  Row(payee, deletePayee)
                )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Payees;
