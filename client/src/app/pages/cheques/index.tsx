import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enGB } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { useAuth } from "@/providers/auth-provider";

import { ChequeType } from "@/lib/types";
import { DATE_FORMAT, SPECTATOR } from "@/lib/constants";

import { useGetPayeesQuery } from "@/api/payees";
import { useGetChequesQuery, useDeleteChequeMutation } from "@/api/cheques";

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
import FetchError from "@/components/component/fetch-error";

import Cards from "./cards";
import RowSkeleton from "./row-skeleton";
import Row from "./row";
import FormDialogDrawer from "./form-dialog-drawer";

import { Printer, FilePlus } from "lucide-react";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  stringToDate,
  dateToString,
  toList,
} from "@/lib/utils";

const Cheques = () => {
  const dummy = [...Array(8)];
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    serial: "",
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

  const serial = searchParams.get("serial") || "";
  const setSerial = (value: string) => {
    setSearchParams(
      (prev) => {
        prev.delete("serial");
        if (value) prev.set("serial", value);
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

  const { data: chequesData, isLoading } = useGetChequesQuery();

  const { data: payeesData, isLoading: filterLoading } = useGetPayeesQuery();
  const payees = toList(payeesData?.payees || [], "name");

  const { mutate: deleteCheque } = useDeleteChequeMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">{t("Cheques")}</h2>
        <div className="flex items-center gap-2 flex-col md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          {user?.role !== SPECTATOR && (
            <FormDialogDrawer>
              <Button className="print:hidden w-full">
                <FilePlus className="ltr:mr-2 rtl:ml-2 h-7 w-7" />{" "}
                {t("Add New")}
              </Button>
            </FormDialogDrawer>
          )}
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
      <Cards isLoading={isLoading} chequesData={chequesData} />
      <Separator />
      <div className="flex flex-col md:flex-row justify-end gap-3">
        <div className="w-full md:w-[335px]">
          <Searchbox
            value={serial}
            setValue={setSerial}
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
      {!isLoading && !chequesData ? (
        <FetchError />
      ) : !isLoading && !chequesData?.cheques?.length ? (
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
              <TableHead className="print:table-cell md:print:table-cell hidden md:table-cell rtl:text-right">
                {t("Description")}
              </TableHead>
              <TableHead className="print:hidden lg:print:hidden hidden lg:table-cell w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : chequesData.cheques.map((cheque: ChequeType) =>
                  Row(cheque, deleteCheque, user?.role)
                )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Cheques;
