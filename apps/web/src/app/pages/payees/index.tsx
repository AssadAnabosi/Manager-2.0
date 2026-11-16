import { useAddDialog, useSearchParam } from "@/hooks/use-url-state";
import { useTranslation } from "react-i18next";
import { PayeeType } from "@/lib/types";

import { usePermissions } from "@/hooks/use-permissions";

import { useGetPayeesQuery, useDeletePayeeMutation } from "@/api/payees";

import { Button } from "@/components/ui/button";
import { ShortcutKey } from "@/components/component/shortcut-key";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/component/page-header";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";
import PayeeFormDialog from "./payee-form-dialog";

import {
  TableSkeleton,
  type SkeletonColumn,
} from "@/components/component/table-skeleton";
import PayeeRow from "./payee-row";

import { FilePlus } from "lucide-react";

const PAYEES_SKELETON: SkeletonColumn[] = [
  { kind: "identity-single" },
  { kind: "lines", className: "hidden md:table-cell" },
  { kind: "text", className: "hidden lg:table-cell" },
  { kind: "empty", className: "hidden lg:table-cell" },
];

const Payees = () => {
  const { canWrite } = usePermissions();
  const addDialog = useAddDialog(canWrite);
  const { t } = useTranslation();
  const [search, setSearch] = useSearchParam("search");

  const { data: payeesData, isLoading } = useGetPayeesQuery();
  const { mutate: deletePayee } = useDeletePayeeMutation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <PageHeader title={t("Payees")}>
        {canWrite && (
          <PayeeFormDialog>
            <Button className="w-full">
              <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
<ShortcutKey>N</ShortcutKey>
            </Button>
          </PayeeFormDialog>
        )}
      </PageHeader>
      {canWrite && (
        <PayeeFormDialog
          open={addDialog.open}
          onOpenChange={addDialog.setOpen}
        />
      )}
      <Separator />
      {/* FILTER */}
      <div className="flex flex-wrap justify-end">
        <div className="w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !payeesData ? (
        <FetchError />
      ) : !isLoading && !payeesData?.payees?.length ? (
        <NoResults
          filterKeys={["search"]}
          action={
            canWrite && (
              <PayeeFormDialog>
                <Button className="print:hidden">
                  <FilePlus className="me-2 h-7 w-7" /> {t("Add New")}
<ShortcutKey>N</ShortcutKey>
                </Button>
              </PayeeFormDialog>
            )
          }
        />
      ) : (
        <Table>
          <TableCaption>{t("A list of payees")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[270px]">{t("Payee Name")}</TableHead>
              <TableHead className="hidden w-[300px] md:table-cell">
                {t("Contact Details")}
              </TableHead>
              <TableHead className="hidden w-max lg:table-cell">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={PAYEES_SKELETON} />
            ) : (
              payeesData?.payees.map((payee: PayeeType) => (
                <PayeeRow key={payee.id} payee={payee} onDelete={deletePayee} />
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Payees;
