import { useDateRangeParams, useSearchParam } from "@/hooks/use-url-state";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";

import { usePermissions } from "@/hooks/use-permissions";

import { BillKind, BillType } from "@/lib/types";

import { useGetBillsQuery, useDeleteBillMutation } from "@/api/bills";

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

import { FilePlus } from "lucide-react";

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
  const fmt = useFormatters();
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
      <PageHeader title={t("Bills")}>
        <DateRangePicker date={date} setDate={setDate} />
        {canWrite && (
          <BillFormDialog>
            <Button className="w-full print:hidden">
              <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
            </Button>
          </BillFormDialog>
        )}
        <PrintButton disabled={isLoading} />
      </PageHeader>
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
            {billsData?.from
              ? billsData.to
                ? t("A list of bills from {{from}} to {{to}}", {
                    from: fmt.date(stringToDate(billsData.from)),
                    to: fmt.date(stringToDate(billsData.to)),
                  })
                : t("A list of bills from {{from}}", {
                    from: fmt.date(stringToDate(billsData.from)),
                  })
              : t("A list of bills")}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[210px]"></TableHead>
              <TableHead className="table-cell w-[120px]">
                {t("Amount")}
              </TableHead>
              <TableHead className="hidden md:table-cell print:table-cell">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell print:table-cell">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell print:hidden lg:print:hidden"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={BILLS_SKELETON} />
            ) : (
              billsData?.bills.map((bill: BillType) => (
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
