import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { useAuth } from "@/providers/auth-provider";

import { BillType } from "@/lib/types";
import { DATE_FORMAT, SPECTATOR } from "@/lib/constants";

import { useGetBillsQuery, useDeleteBillMutation } from "@/api/bills";

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

import DateRangePicker from "@/components/component/date-picker-range";
import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";

import Cards from "./cards";
import Row from "./row";
import RowSkeleton from "./row-skeleton";
import FormDialogDrawer from "./form-dialog-drawer";

import { Printer, FilePlus } from "lucide-react";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  dateToString,
  stringToDate,
} from "@/lib/utils";

const Bills = () => {
  const dummy = [...Array(8)];
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    search: "",
    from: getFirstDayOfCurrentMonth(),
    to: getLastDayOfCurrentMonth(),
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

  const date = {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  };
  const setDate = (date: DateRange) => {
    setSearchParams(
      (prev) => {
        prev.delete("from");
        prev.delete("to");
        if (date) {
          if (date.from) prev.set("from", dateToString(date.from));
          if (date.to) prev.set("to", dateToString(date.to));
        }
        return prev;
      },
      { replace: true }
    );
  };
  const { data: billsData, isLoading } = useGetBillsQuery();

  const { mutate: deleteBill } = useDeleteBillMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">{t("Bills")}</h2>
        <div className="flex items-center gap-2 flex-col md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          {user?.role !== SPECTATOR && (
            <FormDialogDrawer>
              <Button className="print:hidden w-full">
                <FilePlus className="ltr:mr-2 rtl:ml-2 h-7 w-7" />{" "}
                {t("Add New")}
              </Button>
            </FormDialogDrawer>
          )}
          <Button
            disabled={isLoading}
            className="w-full print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="ltr:mr-2 rtl:ml-2 h-6 w-6" /> {t("Print")}
          </Button>
        </div>
      </div>
      <Separator />
      {/* CARDS */}
      <Cards billsData={billsData} isLoading={isLoading} />
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <div className="w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !billsData ? (
        <FetchError />
      ) : !isLoading && !billsData?.bills?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {billsData?.from ? (
              billsData.to ? (
                <>
                  {t("A list of bills")} {t("from")}{" "}
                  {format(stringToDate(billsData.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(stringToDate(billsData.to), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of bills")} {t("from")}{" "}
                  {format(stringToDate(billsData.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              )
            ) : (
              <>{t("A list of bills")}</>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[210px]"></TableHead>
              <TableHead className="table-cell w-[120px] rtl:text-right">
                {t("Value")}
              </TableHead>
              <TableHead className="print:table-cell hidden md:table-cell rtl:text-right">
                {t("Description")}
              </TableHead>
              <TableHead className="print:table-cell hidden lg:table-cell rtl:text-right w-max">
                {t("Remarks")}
              </TableHead>
              <TableHead className="print:hidden lg:print:hidden hidden lg:table-cell w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : billsData.bills.map((bill: BillType) =>
                  Row(bill, deleteBill, user?.role)
                )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Bills;
