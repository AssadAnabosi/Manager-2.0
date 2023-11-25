import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

import Row from "./row";
import RowSkeleton from "./row-skeleton";

import CardIcon from "@/components/icons/cardIcon";
import { BarChartIcon, ClockIcon, DownloadIcon } from "@radix-ui/react-icons";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  toList,
  currencyFormatter,
  numberFormatter,
} from "@/lib/utils";

import logsData from "@/data/logs.json";
import usersData from "@/data/users.json";

const Logs = () => {
  // logsData.logs=[];
  const dummy = [...Array(8)];
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    filter: "",
    from: getFirstDayOfCurrentMonth().toString(),
    to: getLastDayOfCurrentMonth().toString(),
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
          if (date.from) prev.set("from", date.from.getTime().toString());
          if (date.to) prev.set("to", date.to.getTime().toString());
        }
        return prev;
      },
      { replace: true }
    );
  };
  const workers = toList(usersData.users, "fullName");

  // set is loading to true for 1500ms
  const [isLoading, setIsLoading] = useState(true);
  setTimeout(() => {
    setIsLoading(false);
  }, 1500);

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
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[146px]" />
            <Skeleton className="h-[146px]" />
            <Skeleton className="h-[146px]" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">
                  {t("Days Worked")}
                </CardTitle>
                <BarChartIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logsData.daysCount}</div>

                <p className="text-xs text-muted-foreground">
                  {t("This does include days worked less than 8-hours.")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">
                  {t("Received Payments")}
                </CardTitle>
                <CardIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currencyFormatter(logsData.paymentsSumValue)}
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("Sum of all payments received.")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">
                  {t("Workday Variance: Balancing Hours")}
                </CardTitle>
                <ClockIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {numberFormatter(logsData.OTVSum)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Expected 8-hour workday; extra hours receive positive, fewer hours negative."
                  )}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <Combobox
          list={workers}
          search={filter}
          setSearch={setFilter}
          placeholder={t("Filter by worker")}
        />
      </div>
      {/* TABLE */}
      {!isLoading && !logsData.logs.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {date?.from ? (
              date.to ? (
                <>
                  {t("A list of timesheets")} {t("from")}{" "}
                  {format(Number(date.from), "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(Number(date.to), "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of timesheets")} {t("from")}{" "}
                  {format(Number(date.from), "EEEE, dd/LL/y", {
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
              <TableHead className="hidden md:table-cell md:w-[60px] 2xl:w-[130px] rtl:text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : logsData.logs.map((log) => Row(log))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Logs;
