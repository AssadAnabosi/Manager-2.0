import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PayeeType } from "@/lib/types";

import { useAuth } from "@/providers/auth-context";

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
import PayeeFormDialog from "./payee-form-dialog";

import RowSkeleton from "./row-skeleton";
import PayeeRow from "./payee-row";

import { FilePlus } from "lucide-react";

const Payees = () => {
  const dummy = [...Array(8)];
  const { user } = useAuth();
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
      <div className="flex flex-col justify-between gap-5 space-y-2 md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">{t("Payees")}</h2>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <PayeeFormDialog>
            <Button className="w-full">
              <FilePlus className="h-7 w-7 ltr:mr-2 rtl:ml-2" /> {t("Add New")}
            </Button>
          </PayeeFormDialog>
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
              <TableHead className="hidden w-[300px] md:table-cell rtl:text-right">
                {t("Contact Details")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell rtl:text-right">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : payeesData.payees.map((payee: PayeeType) => (
                  <PayeeRow
                    key={payee.id}
                    payee={payee}
                    onDelete={deletePayee}
                    userRole={user?.role}
                  />
                ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Payees;
