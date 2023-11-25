import { useState } from "react";
import { useTranslation } from "react-i18next";

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

import payeesData from "@/data/payees.json";

const Payees = () => {
  const { t } = useTranslation();
  // payeesData.payees=[];
  const dummy = [...Array(8)];
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
        <h2 className="text-3xl font-bold tracking-tight">{t("Payees")}</h2>
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
      {!isLoading && !payeesData.payees.length ? (
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
              <TableHead className="w-max lg:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : payeesData.payees.map((payee) => Row(payee))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Payees;
