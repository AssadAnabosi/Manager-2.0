import {
  useAddDialog,
  useDateRangeParams,
  useSearchParam,
} from "@/hooks/use-url-state";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";

import { usePermissions } from "@/hooks/use-permissions";

import { ChequeType } from "@/lib/types";

import { useGetPayeesQuery } from "@/api/payees";
import { useGetChequesQuery, useDeleteChequeMutation } from "@/api/cheques";

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

import { FilePlus } from "lucide-react";

import { stringToDate, toList } from "@/lib/utils";

const CHEQUES_SKELETON: SkeletonColumn[] = [
  { kind: "identity" },
  { kind: "badge" },
  { kind: "text", className: "hidden md:table-cell" },
  { kind: "empty", className: "hidden md:table-cell" },
];

const Cheques = () => {
  const { canWrite } = usePermissions();
  const addDialog = useAddDialog();
  const { t } = useTranslation();
  const fmt = useFormatters();
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
      <PageHeader title={t("Cheques")}>
        <DateRangePicker date={date} setDate={setDate} />
        {canWrite && (
          <ChequeFormDialog>
            <Button className="w-full print:hidden">
              <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
            </Button>
          </ChequeFormDialog>
        )}
        <PrintButton disabled={isLoading} />
      </PageHeader>
      {canWrite && (
        <ChequeFormDialog
          open={addDialog.open}
          onOpenChange={addDialog.setOpen}
          defaults={{ serial: addDialog.get("addSerial") }}
        />
      )}
      <Separator />
      {/* CARDS */}
      <Cards isLoading={isLoading} chequesData={chequesData} />
      <Separator />
      <div className="flex flex-col justify-end gap-3 md:flex-row">
        <div className="w-full md:w-[335px]">
          <Searchbox
            value={serial}
            setValue={setSerial}
            placeholder={t("Serial No.")}
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
        <NoResults
          filterKeys={["filter", "serial", "from", "to"]}
          filteredAction={
            canWrite &&
            serial && (
              <Button onClick={() => addDialog.openWith({ addSerial: serial })}>
                <FilePlus className="me-2 h-7 w-7" />{" "}
                {t("Add cheque with serial {{serial}}", { serial })}
              </Button>
            )
          }
          action={
            canWrite && (
              <ChequeFormDialog>
                <Button className="print:hidden">
                  <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
                </Button>
              </ChequeFormDialog>
            )
          }
        />
      ) : (
        <Table>
          <TableCaption>
            {chequesData?.from
              ? chequesData.to
                ? t("A list of cheques from {{from}} to {{to}}", {
                    from: fmt.date(stringToDate(chequesData.from)),
                    to: fmt.date(stringToDate(chequesData.to)),
                  })
                : t("A list of cheques from {{from}}", {
                    from: fmt.date(stringToDate(chequesData.from)),
                  })
              : t("A list of cheques")}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px]">{t("Serial No.")}</TableHead>
              <TableHead className="table-cell w-[120px]">
                {t("Value")}
              </TableHead>
              <TableHead className="hidden md:table-cell print:table-cell md:print:table-cell">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell print:hidden lg:print:hidden"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={CHEQUES_SKELETON} />
            ) : (
              chequesData?.cheques.map((cheque: ChequeType) => (
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
