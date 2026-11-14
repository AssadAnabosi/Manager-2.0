import { useDateRangeParams, useSearchParam } from "@/hooks/use-url-state";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { endOfMonth, parse, startOfMonth } from "date-fns";
import { useFormatters } from "@/hooks/use-locale";

import { useAuth } from "@/providers/auth-context";
import { usePermissions } from "@/hooks/use-permissions";

import { LogType } from "@/lib/types";
import { USER } from "@/lib/constants";

import { useGetUsersQuery } from "@/api/users";
import { useGetLogsQuery, useDeleteLogMutation } from "@/api/logs";

import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/component/page-header";
import { PrintButton } from "@/components/component/print-button";
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
import {
  TableSkeleton,
  type SkeletonColumn,
} from "@/components/component/table-skeleton";
import LogRow from "./log-row";
import LogFormDialog from "./log-form-dialog";

import { CalendarDays, FilePlus, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Combobox from "@/components/component/combobox";
import AttendanceCalendar from "./attendance-calendar";
import { toList, stringToDate } from "@/lib/utils";

const WORKSHEETS_SKELETON: SkeletonColumn[] = [
  { kind: "identity" },
  { kind: "badge" },
  { kind: "text", className: "hidden md:table-cell" },
  { kind: "text", className: "hidden md:table-cell" },
  { kind: "text", className: "hidden lg:table-cell" },
  { kind: "empty", className: "hidden md:table-cell" },
];

const Logs = () => {
  const { user } = useAuth();
  const { canWrite } = usePermissions();
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [filter, setFilter] = useSearchParam(
    "filter",
    user?.role === USER ? user.id : ""
  );
  const [date, setDate] = useDateRangeParams();
  // "list" is the table; "calendar" is one worker's month at a glance
  const [viewParam, setView] = useSearchParam("view", "list");
  const view = viewParam === "calendar" ? "calendar" : "list";
  const month = startOfMonth(
    parse(date.from ?? "", "yyyy-MM-dd", new Date()).getTime()
      ? parse(date.from ?? "", "yyyy-MM-dd", new Date())
      : new Date()
  );
  const monthRange = (m: Date) => ({
    from: startOfMonth(m),
    to: endOfMonth(m),
  });
  // the calendar always shows exactly one month
  useEffect(() => {
    if (view !== "calendar") return;
    const { from, to } = monthRange(month);
    const same = (d: Date, s: string | null) =>
      s !== null &&
      d.getTime() === parse(s, "yyyy-MM-dd", new Date()).getTime();
    if (!same(from, date.from) || !same(to, date.to)) setDate({ from, to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, date.from, date.to]);
  const oneWorker = filter && !filter.includes(",") ? filter : "";
  // a day tapped in the calendar that has no record yet
  const [addDay, setAddDay] = useState<Date | null>(null);
  const { data: logsData, isLoading } = useGetLogsQuery();

  const { data: usersData, isLoading: filterLoading } = useGetUsersQuery();
  const workers = toList(usersData?.users || [], "fullName", true);

  const { mutate: deleteLog } = useDeleteLogMutation();

  return (
    <div className="flex-1 space-y-4 p-4 pt-4 sm:p-8 sm:pt-6 print:px-4">
      {/* HEADER */}
      <PageHeader title={t("Work Timesheets")}>
        {canWrite && (
          <LogFormDialog>
            <Button className="w-full print:hidden">
              <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
            </Button>
          </LogFormDialog>
        )}
        <PrintButton disabled={isLoading} />
      </PageHeader>
      {canWrite && (
        <LogFormDialog
          open={addDay !== null}
          onOpenChange={(open) => !open && setAddDay(null)}
          defaults={{ worker: oneWorker, date: addDay ?? undefined }}
        />
      )}
      <Separator />
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between print:hidden">
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="list">
              <List /> {t("List")}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays /> {t("Calendar")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {view === "list" ? (
          <DateRangePicker
            className="md:w-auto"
            date={date}
            setDate={setDate}
          />
        ) : (
          user?.role !== USER && (
            <Combobox
              isLoading={filterLoading}
              list={workers}
              filter={oneWorker}
              setFilter={setFilter}
              placeholder={t("Select a worker")}
            />
          )
        )}
      </div>
      {view === "calendar" ? (
        <div className="space-y-4">
          {oneWorker ? (
            <AttendanceCalendar
              month={month}
              logs={logsData?.logs ?? []}
              loading={isLoading}
              workerName={workers.find((w) => w.value === oneWorker)?.label}
              onMonthChange={(m) => setDate(monthRange(m))}
              onAddDay={canWrite ? setAddDay : undefined}
            />
          ) : (
            <p className="text-muted-foreground py-12 text-center">
              {t("Select a worker to see their attendance")}
            </p>
          )}
        </div>
      ) : (
        <>
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
            <NoResults
              filterKeys={["filter", "from", "to"]}
              action={
                canWrite && (
                  <LogFormDialog>
                    <Button className="print:hidden">
                      <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
                    </Button>
                  </LogFormDialog>
                )
              }
            />
          ) : (
            <Table>
              <TableCaption>
                {logsData?.from
                  ? logsData.to
                    ? t("A list of worksheets from {{from}} to {{to}}", {
                        from: fmt.date(stringToDate(logsData.from)),
                        to: fmt.date(stringToDate(logsData.to)),
                      })
                    : t("A list of worksheets from {{from}}", {
                        from: fmt.date(stringToDate(logsData.from)),
                      })
                  : t("A list of worksheets")}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[270px] print:w-[190px]"></TableHead>
                  <TableHead className="w-[80px] text-center">
                    {t("Attended")}
                  </TableHead>
                  <TableHead className="hidden w-[150px] md:table-cell md:w-[280px] print:table-cell md:print:w-[150px]">
                    {t("Workday Variance: Balancing Hours")}
                  </TableHead>
                  <TableHead className="hidden w-[120px] md:table-cell print:table-cell">
                    {t("Payment")}
                  </TableHead>
                  <TableHead className="hidden w-max lg:table-cell print:table-cell">
                    {t("Remarks")}
                  </TableHead>
                  <TableHead className="hidden w-[120px] 2xl:table-cell print:hidden 2xl:print:hidden"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={WORKSHEETS_SKELETON} />
                ) : (
                  logsData?.logs.map((log: LogType) => (
                    <LogRow key={log.id} log={log} onDelete={deleteLog} />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
};

export default Logs;
