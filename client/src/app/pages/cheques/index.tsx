import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enGB } from "date-fns/locale";
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
import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";

import RowSkeleton from "./row-skeleton";
import Row from "./row";

import CardIcon from "@/components/icons/cardIcon";
import { DownloadIcon } from "@radix-ui/react-icons";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  toList,
  currencyFormatter,
} from "@/lib/utils";

import chequesData from "@/data/cheques.json";
import payeesData from "@/data/payees.json";

const Cheques = () => {
  const { t } = useTranslation();
  // chequesData.cheques=[];
  const payees = toList(payeesData.payees, "name");
  const dummy = [...Array(8)];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
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
        <h2 className="text-3xl font-bold tracking-tight">{t("Cheques")}</h2>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[146px]" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
                <CardTitle className="text-sm font-medium">
                  {t("Total Sum")}
                </CardTitle>
                <CardIcon />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currencyFormatter(chequesData.total)}
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("Sum of all cheques in the selected range.")}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Separator />
      <div className="flex justify-end gap-3">
        <div className="w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
        <Combobox
          list={payees}
          search={filter}
          setSearch={setFilter}
          placeholder={t("Filter by payee")}
        />
      </div>
      {/* TABLE */}
      {!isLoading && !chequesData.cheques.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {date?.from ? (
              date.to ? (
                <>
                  {t("A list of cheques")} {t("from")}{" "}
                  {format(date.from, "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(date.to, "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of cheques")} {t("from")}{" "}
                  {format(date.from, "EEEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              )
            ) : (
              <>{t("A list of cheques")}</>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px] rtl:text-right">
                {t("Serial No.")}
              </TableHead>
              <TableHead className="table-cell w-[120px] rtl:text-right">
                {t("Value")}
              </TableHead>
              <TableHead className="hidden md:table-cell rtl:text-right">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden md:table-cell md:w-[60px] lg:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : chequesData.cheques.map((cheque) => Row(cheque))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Cheques;
