import { useState } from "react";
import AvatarCombo from "@/components/component/avatar-combo";
import { format } from "date-fns";
import {
  CalendarIcon,
  BarChartIcon,
  ClockIcon,
  CheckIcon,
  Cross2Icon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/component/date-picker-range";
import { DownloadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRange } from "react-day-picker";
import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
} from "@/lib/date";
import { LogType } from "@/types";

import logsData from "@/data/logs.json";
import usersData from "@/data/users.json";
import { toList } from "@/lib/utils";
import Combobox from "@/components/component/combobox";

import NoResults from "@/components/component/no-results";
import DeleteDialog from "@/components/component/delete-dialog";
import EditDialog from "./form-dialog";
import ActionDropdownMenu from "./action-drop-down";

const CardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className="h-4 w-4 text-muted-foreground"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const Logs = () => {
  // logsData.logs=[];
  const dummy = [...Array(15)];
  const [search, setSearch] = useState("");
  const workers = toList(usersData.users, "fullName");
  const [date, setDate] = useState<DateRange>({
    from: getFirstDayOfCurrentMonth(),
    to: getLastDayOfCurrentMonth(),
  });

  // set is loading to true for 1500ms
  const [isLoading, setIsLoading] = useState(true);
  setTimeout(() => {
    setIsLoading(false);
  }, 1500);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">Worksheets</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker date={date} setDate={setDate} />
          <div className="hidden md:inline-block">
            <Button>
              <DownloadIcon className="mr-2 h-4 w-4" /> Download
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
                  Days Worked
                </CardTitle>
                <BarChartIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logsData.daysCount}</div>

                <p className="text-xs text-muted-foreground">
                  This does include days worked less than 8-hours
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">
                  Received Payments
                </CardTitle>
                <CardIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className="text-primary">₪ </span>
                  {logsData.paymentsSumValue}
                </div>

                <p className="text-xs text-muted-foreground">
                  Sum of all payments received.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">
                  Workday Variance: Balancing Hours
                </CardTitle>
                <ClockIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logsData.OTVSum}</div>
                <p className="text-xs text-muted-foreground">
                  Expected 8-hour workday; extra hours receive positive, fewer
                  hours negative.
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
          search={search}
          setSearch={setSearch}
          placeholder="Select worker..."
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
                  A list of logs from {format(date.from, "EEEE, dd/LL/y")} to{" "}
                  {format(date.to, "EEEE, dd/LL/y")}
                </>
              ) : (
                <>A list of logs from {format(date.from, "EEEE, dd/LL/y")}</>
              )
            ) : (
              <>A list of logs</>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px]"></TableHead>
              <TableHead className="w-[80px] text-center">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[150px] md:w-[280px]">
                Workday Variance: Balancing Hours
              </TableHead>
              <TableHead className="hidden md:table-cell w-[120px]">
                Payment
              </TableHead>
              <TableHead className="hidden lg:table-cell w-max">
                Remarks
              </TableHead>
              <TableHead className="hidden md:table-cell md:w-[60px] 2xl:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => SkeletonRow(index))
              : logsData.logs.map((log) => InsertLog(log))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Logs;

const InsertLog = (log: LogType) => {
  return (
    <TableRow key={log.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={log.worker.fullName}
          description={format(new Date(log.date), "EEEE, dd/LL/y")}
          fallback={<CalendarIcon className="h-5 w-5" />}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="text-center">
        {log.isAbsent ? (
          <Badge
            variant="destructive"
            className="w-[65px] sm:w-[100%] sm:max-w-[65px] md:w-[65px] h-[20px]"
          >
            <Cross2Icon className="h-4 w-4 mx-auto" />
          </Badge>
        ) : (
          <Badge
            variant="success"
            className="w-[65px] sm:w-[100%] sm:max-w-[65px] md:w-[65px] h-[20px]"
          >
            <CheckIcon className="h-4 w-4 mx-auto" />
          </Badge>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {log.startingTime} - {log.finishingTime} ({log.OTV})
      </TableCell>
      <TableCell className="hidden md:table-cell">₪ {log.payment}</TableCell>
      <TableCell className="hidden lg:table-cell">{log.remarks}</TableCell>
      <TableCell className="hidden md:table-cell 2xl:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="hidden 2xl:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(log.id)}>
          <Button variant="delete">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DeleteDialog>
      </TableCell>
    </TableRow>
  );
};

const SkeletonRow = (index: number) => {
  return (
    <TableRow key={index} className="h-[73px]">
      <TableCell>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-[14px] w-[100px] leading-none " />
            <Skeleton className="h-[20px] w-[120px] " />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[65px] sm:w-[100%] sm:max-w-[65px] md:w-[65px] rounded-full " />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-5 w-[120px] rounded-full " />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-5 w-[100%] rounded-full " />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-5 w-[100%] rounded-full " />
      </TableCell>
      <TableCell className="hidden md:table-cell"></TableCell>
    </TableRow>
  );
};
