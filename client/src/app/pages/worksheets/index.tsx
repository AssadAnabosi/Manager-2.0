import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";

import { LogType } from "@/lib/types";
import { DATE_FORMAT } from "@/lib/constants";

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
import Combobox from "@/components/component/combobox";
import NoResults from "@/components/component/no-results";

import Cards from "./cards";
import Row from "./row";
import RowSkeleton from "./row-skeleton";

import { DownloadIcon } from "@radix-ui/react-icons";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  toList,
  dateToString,
  stringToDate,
} from "@/lib/utils";

const Logs = () => {
  const dummy = [...Array(8)];
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    filter: "",
    from: getFirstDayOfCurrentMonth(),
    to: getLastDayOfCurrentMonth(),
  });

  const filter = searchParams.get("filter") || "";
  const setFilter = (value: string) => {
    setSearchParams(
      (prev) => {
        prev.delete("filter");
        if (value) prev.set("filter", value);
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
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", { filter, from: date.from, to: date.to }],
    queryFn: async () => {
      const { data: response } = await axios.get("/logs", {
        params: {
          filter,
          from: date.from,
          to: date.to,
        },
      });
      return response.data;
    },
  });

  const { data: usersData, isLoading: filterLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: response } = await axios.get("/users", {
        params: {
          active: true,
        },
      });
      return response.data;
    },
  });

  const workers = toList(usersData?.users || [], "fullName");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("Work Timesheets")}
        </h2>
        <div className="flex space-x-2 rtl:space-x-reverse w-full md:w-auto">
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
      <Cards isLoading={isLoading} logsData={logsData} />
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end h-[40px] flex-wrap">
        <Combobox
          isLoading={filterLoading}
          list={workers}
          filter={filter}
          setFilter={setFilter}
          placeholder={t("Filter by worker")}
        />
      </div>
      {/* TABLE */}
      {!isLoading && !logsData?.logs?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {date?.from ? (
              date.to ? (
                <>
                  {t("A list of timesheets")} {t("from")}{" "}
                  {format(stringToDate(date.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(stringToDate(date.to), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of timesheets")} {t("from")}{" "}
                  {format(stringToDate(date.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              )
            ) : (
              <>{t("A list of timesheets")}</>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px]"></TableHead>
              <TableHead className="w-[80px] text-center">
                {t("Status")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-[150px] md:w-[280px] rtl:text-right">
                {t("Workday Variance: Balancing Hours")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-[120px] rtl:text-right">
                {t("Payment")}
              </TableHead>
              <TableHead className="hidden lg:table-cell w-max rtl:text-right">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden 2xl:table-cell w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : logsData.logs.map((log: LogType) => Row(log))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Logs;
