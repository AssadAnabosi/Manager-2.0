import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { useAuth } from "@/providers/auth-provider";

import { LogType } from "@/lib/types";
import { DATE_FORMAT, SPECTATOR, USER } from "@/lib/constants";

import { useGetUsersQuery } from "@/api/users";
import { useGetLogsQuery, useDeleteLogMutation } from "@/api/logs";

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
import MultiSelectFormField from "@/components/component/multi-select";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";

import Cards from "./cards";
import RowSkeleton from "./row-skeleton";
import Row from "./row";
import FormDialogDrawer from "./form-dialog-drawer";

import { Printer, FilePlus } from "lucide-react";
import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  toList,
  dateToString,
  stringToDate,
} from "@/lib/utils";

const Logs = () => {
  const dummy = [...Array(8)];
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    filter: user?.role === USER ? user.id : "",
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
      { replace: true },
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
      { replace: true },
    );
  };
  const { data: logsData, isLoading } = useGetLogsQuery();

  const { data: usersData, isLoading: filterLoading } = useGetUsersQuery();
  const workers = toList(usersData?.users || [], "fullName", true);

  const { mutate: deleteLog } = useDeleteLogMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 print:px-4">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 space-y-2 md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("Work Timesheets")}
        </h2>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          <FormDialogDrawer>
            {![USER, SPECTATOR].includes(user?.role as string) && (
              <Button className="w-full print:hidden">
                <FilePlus className="h-7 w-7 ltr:mr-2 rtl:ml-2" />{" "}
                {t("Add New")}
              </Button>
            )}
          </FormDialogDrawer>
          <Button
            disabled={isLoading}
            className="w-full print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="h-6 w-6 ltr:mr-2 rtl:ml-2" /> {t("Print")}
          </Button>
        </div>
      </div>
      <Separator />
      {/* CARDS */}
      <Cards isLoading={isLoading} logsData={logsData} />
      <Separator />
      {/* FILTER */}
      <div className="flex flex-wrap justify-end">
        {user?.role !== USER && (
          <MultiSelectFormField
            isLoading={filterLoading}
            list={workers}
            // filter={filter}
            // setFilter={setFilter}
            placeholder={t("Filter by worker")}
            onValueChange={(value) => {
              setFilter(value.toString());
            }}
            defaultValue={filter ? filter.split(",") : []}
          />
        )}
      </div>
      {/* TABLE */}
      {!isLoading && !logsData ? (
        <FetchError />
      ) : !isLoading && !logsData?.logs?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {logsData?.from ? (
              logsData.to ? (
                <>
                  {t("A list of worksheets")} {t("from")}{" "}
                  {format(stringToDate(logsData.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(stringToDate(logsData.to), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of worksheets")} {t("from")}{" "}
                  {format(stringToDate(logsData.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              )
            ) : (
              <>{t("A list of worksheets")}</>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px] print:w-[190px]"></TableHead>
              <TableHead className="w-[80px] text-center">
                {t("Attended")}
              </TableHead>
              <TableHead className="hidden w-[150px] md:table-cell md:w-[280px] rtl:text-right print:table-cell md:print:w-[150px]">
                {t("Workday Variance: Balancing Hours")}
              </TableHead>
              <TableHead className="hidden w-[120px] md:table-cell rtl:text-right print:table-cell">
                {t("Payment")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell rtl:text-right print:table-cell">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden w-[120px] 2xl:table-cell print:hidden 2xl:print:hidden"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : logsData.logs.map((log: LogType) =>
                  Row(log, deleteLog, user?.role),
                )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Logs;
