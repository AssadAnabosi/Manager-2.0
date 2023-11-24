import { useState } from "react";
import AvatarCombo from "@/components/component/avatar-combo";
import { format } from "date-fns";
import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/component/date-picker-range";
import { DownloadIcon } from "lucide-react";
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
import { BillType } from "@/types";

import billsData from "@/data/bills.json";

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

import Searchbox from "@/components/component/searchbox";

const Bills = () => {
  // billsData.bills=[];
  const dummy = [...Array(4)];
  const [search, setSearch] = useState("");
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
        <h2 className="text-3xl font-bold tracking-tight">Bill</h2>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[146px]" />
            <Skeleton className="h-[146px]" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">Range Sum</CardTitle>
                <CardIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className="text-primary">₪ </span>
                  {billsData.rangeTotalValue}
                </div>

                <p className="text-xs text-muted-foreground">
                  Sum of all bills in the selected range.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">Total Sum</CardTitle>
                <CardIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className="text-primary">₪ </span>
                  {billsData.allTimeTotalValue}
                </div>

                <p className="text-xs text-muted-foreground">
                  Sum of all bills ever.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <div className=" w-[100%] md:w-[335px]">
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
              <TableHead className="w-[210px]"></TableHead>
              <TableHead className="table-cell w-[120px]">Value</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden lg:table-cell">Remarks</TableHead>
              <TableHead className="hidden md:table-cell md:w-[60px] lg:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => SkeletonRow(index))
              : billsData.bills.map((bill) => InsertBill(bill))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Bills;

const InsertBill = (bill: BillType) => {
  return (
    <TableRow key={bill.id} className="h-[73px]">
      <TableCell>
        <AvatarCombo
          title={format(new Date(bill.date), "EEEE")}
          description={format(new Date(bill.date), "dd/LL/y")}
          fallback={<CalendarIcon className="h-5 w-5" />}
        ></AvatarCombo>
      </TableCell>
      <TableCell className="table-cell">₪ {bill.value}</TableCell>
      <TableCell className="hidden md:table-cell">{bill.description}</TableCell>
      <TableCell className="hidden lg:table-cell">{bill.remarks}</TableCell>
      <TableCell className="text-right hidden md:table-cell lg:hidden">
        <ActionDropdownMenu />
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <EditDialog>
          <Button variant="edit">
            <Pencil2Icon className="h-4 w-4" />
          </Button>
        </EditDialog>
        <DeleteDialog onClick={() => console.log(bill.id)}>
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
            <Skeleton className="h-[14px] w-[120px] leading-none " />
            <Skeleton className="h-[20px] w-[100px] " />
          </div>
        </div>
      </TableCell>
      <TableCell className="table-cell ">
        <Skeleton className="h-5 w-[85px] rounded-full " />
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
