import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enGB } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";

import { ChequeType } from "@/lib/types";
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
import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";

import RowSkeleton from "./row-skeleton";
import Row from "./row";
import Cards from "./cards";

import { DownloadIcon } from "@radix-ui/react-icons";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  stringToDate,
  dateToString,
  toList,
} from "@/lib/utils";

const Cheques = () => {
  // chequesData.cheques=[];
  const dummy = [...Array(8)];
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    search: "",
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
  const { data: chequesData, isLoading } = useQuery({
    queryKey: ["cheques", { search, filter, from: date.from, to: date.to }],
    queryFn: async () => {
      const { data: response } = await axios.get("/cheques", {
        params: {
          search,
          filter,
          from: date.from,
          to: date.to,
        },
      });
      return response.data;
    },
  });
  const { data: payeesData, isLoading: filterLoading } = useQuery({
    queryKey: ["payees"],
    queryFn: async () => {
      const { data: response } = await axios.get("/payees");
      return response.data;
    },
  });

  const payees = toList(payeesData?.payees || [], "name");

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
      <Cards isLoading={isLoading} chequesData={chequesData} />
      <Separator />
      <div className="flex justify-end gap-3">
        <div className="w-full md:w-[335px]">
          <Searchbox
            value={search}
            setValue={setSearch}
            placeholder={"Serial No."}
          />
        </div>
        <Combobox
          isLoading={filterLoading}
          list={payees}
          filter={filter}
          setFilter={setFilter}
          placeholder={t("Filter by payee")}
        />
      </div>
      {/* TABLE */}
      {!isLoading && !chequesData?.cheques?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {date?.from ? (
              date.to ? (
                <>
                  {t("A list of cheques")} {t("from")}{" "}
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
                  {t("A list of cheques")} {t("from")}{" "}
                  {format(stringToDate(date.from), DATE_FORMAT, {
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
              <TableHead className="hidden lg:table-cell w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : chequesData.cheques.map((cheque: ChequeType) => Row(cheque))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Cheques;
