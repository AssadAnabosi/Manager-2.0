import { useDateRangeParams, useSearchParam } from "@/hooks/use-url-state";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";

import { usePermissions } from "@/hooks/use-permissions";

import { BillKind, BillType } from "@/lib/types";
import { DATE_FORMAT } from "@/lib/constants";

import { useGetBillsQuery, useDeleteBillMutation } from "@/api/bills";

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
import Searchbox from "@/components/component/searchbox";
import TypeFilter from "./type-filter";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";

import Cards from "./cards";
import BillRow from "./bill-row";
import {
  TableSkeleton,
  type SkeletonColumn,
} from "@/components/component/table-skeleton";
import BillFormDialog from "./bill-form-dialog";

import { Printer, FilePlus } from "lucide-react";

import { stringToDate } from "@/lib/utils";

const BILLS_SKELETON: SkeletonColumn[] = [
  { kind: "identity" },
  { kind: "badge" },
  { kind: "text", className: "hidden md:table-cell" },
  { kind: "text", className: "hidden lg:table-cell" },
  { kind: "empty", className: "hidden lg:table-cell" },
];

const Bills = () => {
  const { canWrite } = usePermissions();
  const { t } = useTranslation();
  const [search, setSearch] = useSearchParam("search");
  const [typeParam, setType] = useSearchParam("type");
  const type: BillKind | "" =
    typeParam === "expense" || typeParam === "income" ? typeParam : "";
  const [date, setDate] = useDateRangeParams();
  const { data: billsData, isLoading } = useGetBillsQuery();

  const { mutate: deleteBill } = useDeleteBillMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 space-y-2 md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">{t("Bills")}</h2>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          {canWrite && (
            <BillFormDialog>
              <Button className="w-full print:hidden">
                <FilePlus className="h-7 w-7 ltr:mr-2 rtl:ml-2" />{" "}
                {t("Add New")}
              </Button>
            </BillFormDialog>
          )}
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
      <Cards billsData={billsData} isLoading={isLoading} />
      <Separator />
      {/* FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TypeFilter value={type} onChange={setType} />
        <div className="w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !billsData ? (
        <FetchError />
      ) : !isLoading && !billsData?.bills?.length ? (
        <NoResults />
      ) : (
        <Table>
          <TableCaption>
            {billsData?.from ? (
              billsData.to ? (
                <>
                  {t("A list of bills")} {t("from")}{" "}
                  {format(stringToDate(billsData.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  {t("to")}{" "}
                  {format(stringToDate(billsData.to), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                <>
                  {t("A list of bills")} {t("from")}{" "}
                  {format(stringToDate(billsData.from), DATE_FORMAT, {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              )
            ) : (
              <>{t("A list of bills")}</>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[210px]"></TableHead>
              <TableHead className="table-cell w-[120px] rtl:text-right">
                {t("Amount")}
              </TableHead>
              <TableHead className="hidden md:table-cell rtl:text-right print:table-cell">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell rtl:text-right print:table-cell">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell print:hidden lg:print:hidden"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={BILLS_SKELETON} />
            ) : (
              billsData.bills.map((bill: BillType) => (
                <BillRow key={bill.id} bill={bill} onDelete={deleteBill} />
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Bills;
