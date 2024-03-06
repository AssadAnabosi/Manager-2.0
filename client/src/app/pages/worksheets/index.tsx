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
import Combobox from "@/components/component/combobox";
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
  const { data: logsData, isLoading } = useGetLogsQuery();

  const { data: usersData, isLoading: filterLoading } = useGetUsersQuery();
  const workers = toList(usersData?.users || [], "fullName", true);

  const { mutate: deleteLog } = useDeleteLogMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 print:px-4">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("Work Timesheets")}
        </h2>
        <div className="flex items-center gap-2 flex-col md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          <FormDialogDrawer>
            {![USER, SPECTATOR].includes(user?.role as string) && (
              <Button className="w-full print:hidden">
                <FilePlus className="ltr:mr-2 rtl:ml-2 h-7 w-7" />{" "}
                {t("Add New")}
              </Button>
            )}
          </FormDialogDrawer>
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
      <Cards isLoading={isLoading} logsData={logsData} />
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        {user?.role !== USER && (
          <Combobox
            isLoading={filterLoading}
            list={workers}
            filter={filter}
            setFilter={setFilter}
            placeholder={t("Filter by worker")}
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
              <TableHead className="print:table-cell hidden md:table-cell w-[150px] md:w-[280px] md:print:w-[150px] rtl:text-right">
                {t("Workday Variance: Balancing Hours")}
              </TableHead>
              <TableHead className="print:table-cell hidden md:table-cell w-[120px] rtl:text-right">
                {t("Payment")}
              </TableHead>
              <TableHead className="print:table-cell hidden lg:table-cell w-max rtl:text-right">
                {t("Remarks")}
              </TableHead>
              <TableHead className="print:hidden 2xl:print:hidden hidden 2xl:table-cell w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : logsData.logs.map((log: LogType) =>
                  Row(log, deleteLog, user?.role)
                )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Logs;
