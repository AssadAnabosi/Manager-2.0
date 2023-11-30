import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";

import { BillType } from "@/lib/types";

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
import DateRangePicker from "@/components/component/date-picker-range";
import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";

import RowSkeleton from "./row-skeleton";
import Row from "./row";
import Cards from "./cards";

import { DownloadIcon } from "@radix-ui/react-icons";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  dateToString,
  stringToDate,
} from "@/lib/utils";

const Bills = () => {
  const dummy = [...Array(8)];
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
  const axios = useAxios();
  const { data: billsData, isLoading } = useQuery({
    queryKey: ["bills", search, date.from, date.to],
    queryFn: async () => {
      const { data: response } = await axios.get("/bills", {
        params: {
          search,
          from: date.from,
          to: date.to,
        },
      });
      console.log(response.data);
      return response.data;
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">{t("Bills")}</h2>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <DateRangePicker date={date} setDate={setDate} />
          <div className="hidden md:inline-block">
            <Button>
              <DownloadIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />{" "}
              {t("Download")}
            </Button>
          </div>
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
      {!isLoading && !billsData.bills.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {date?.from ? (
              date.to ? (
                <>
                  {t("A list of bills")} {t("from")}{" "}
                  {format(stringToDate(date.from), "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(stringToDate(date.to), "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of bills")} {t("from")}{" "}
                  {format(stringToDate(date.from), "EEEE, dd/LL/y", {
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
              <TableHead className="hidden md:table-cell rtl:text-right">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden lg:table-cell rtl:text-right">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden md:table-cell md:w-[60px] lg:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : billsData.bills.map((bill: BillType) => Row(bill))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Bills;
