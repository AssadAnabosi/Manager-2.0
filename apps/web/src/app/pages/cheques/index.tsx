import { useDateRangeParams, useSearchParam } from "@/hooks/use-url-state";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enGB } from "date-fns/locale";

import { usePermissions } from "@/hooks/use-permissions";

import { ChequeType } from "@/lib/types";
import { DATE_FORMAT } from "@/lib/constants";

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
import MultiSelectFormField from "@/components/component/multi-select";
import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";

import Cards from "./cards";
import {
  TableSkeleton,
  type SkeletonColumn,
} from "@/components/component/table-skeleton";
import ChequeRow from "./cheque-row";
import ChequeFormDialog from "./cheque-form-dialog";

import { Printer, FilePlus } from "lucide-react";

import { stringToDate, toList } from "@/lib/utils";

const CHEQUES_SKELETON: SkeletonColumn[] = [
  { kind: "identity" },
  { kind: "badge" },
  { kind: "text", className: "hidden md:table-cell" },
  { kind: "empty", className: "hidden md:table-cell" },
];

const Cheques = () => {
  const { canWrite } = usePermissions();
  const { t } = useTranslation();
  const [filter, setFilter] = useSearchParam("filter");
  const [serial, setSerial] = useSearchParam("serial");
  const [date, setDate] = useDateRangeParams();

  const { data: chequesData, isLoading } = useGetChequesQuery();

  const { data: payeesData, isLoading: filterLoading } = useGetPayeesQuery();
  const payees = toList(payeesData?.payees || [], "name");

  const { mutate: deleteCheque } = useDeleteChequeMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 space-y-2 md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">{t("Cheques")}</h2>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          {canWrite && (
            <ChequeFormDialog>
              <Button className="w-full print:hidden">
                <FilePlus className="h-7 w-7 ltr:mr-2 rtl:ml-2" />{" "}
                {t("Add New")}
              </Button>
            </ChequeFormDialog>
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
      <Cards isLoading={isLoading} chequesData={chequesData} />
      <Separator />
      <div className="flex flex-col justify-end gap-3 md:flex-row">
        <div className="w-full md:w-[335px]">
          <Searchbox
            value={serial}
            setValue={setSerial}
            placeholder={"Serial No."}
          />
        </div>
        <MultiSelectFormField
          isLoading={filterLoading}
          list={payees}
          placeholder={t("Filter by payee")}
          onValueChange={(value) => {
            setFilter(value.toString());
          }}
          defaultValue={filter ? filter.split(",") : []}
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
              <TableHead className="hidden md:table-cell rtl:text-right print:table-cell md:print:table-cell">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell print:hidden lg:print:hidden"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={CHEQUES_SKELETON} />
            ) : (
              chequesData.cheques.map((cheque: ChequeType) => (
                <ChequeRow
                  key={cheque.id}
                  cheque={cheque}
                  onDelete={deleteCheque}
                />
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Cheques;
