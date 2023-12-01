import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { BillType } from "@/lib/types";
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
import { useToast } from "@/components/ui/use-toast";
import DateRangePicker from "@/components/component/date-picker-range";
import Searchbox from "@/components/component/searchbox";
import NoResults from "@/components/component/no-results";
import FetchError from "@/components/component/fetch-error";

import RowSkeleton from "./row-skeleton";
import Row from "./row";
import Cards from "./cards";
import FormDialog from "./form-dialog";

import { DownloadIcon, FilePlusIcon } from "@radix-ui/react-icons";

import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  dateToString,
  stringToDate,
} from "@/lib/utils";

const Bills = () => {
  const dummy = [...Array(8)];
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams({
    search: "",
    from: getFirstDayOfCurrentMonth(),
    to: getLastDayOfCurrentMonth(),
  });

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
  const { data: billsData, isLoading } = useQuery({
    queryKey: ["bills", { search, from: date.from, to: date.to }],
    queryFn: async () => {
      const { data: response } = await axios.get("/bills", {
        params: {
          search,
          from: date.from,
          to: date.to,
        },
      });
      return response.data;
    },
  });
  const queryClient = useQueryClient();
  const { mutate: deleteBill } = useMutation({
    mutationFn: (id: string) => axios.delete(`/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bills"],
      });
      toast({
        variant: "success",
        title: "Bill deleted",
        description: `Bill was deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    },
  });
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER */}
      <div className="flex space-y-2 flex-col justify-between md:flex-row gap-5">
        <h2 className="text-3xl font-bold tracking-tight">{t("Bills")}</h2>
        <div className="flex items-center gap-2 flex-col md:flex-row">
          <DateRangePicker date={date} setDate={setDate} />
          <FormDialog>
            <Button className="w-full">
              <FilePlusIcon className="ltr:mr-2 rtl:ml-2 h-7 w-7" />{" "}
              {t("Add New")}
            </Button>
          </FormDialog>
          <div className="hidden md:inline-block">
            <Button>
              <DownloadIcon className="ltr:mr-2 rtl:ml-2 h-6 w-6" />{" "}
              {t("Download")}
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      {/* CARDS */}
      <Cards billsData={billsData} isLoading={isLoading} />
      <Separator />
      {/* FILTER */}
      <div className="flex justify-end flex-wrap">
        <div className="w-full md:w-[335px]">
          <Searchbox value={search} setValue={setSearch} />
        </div>
      </div>
      {/* TABLE */}
      {!isLoading && !billsData ? (
        <FetchError />
      ) : !billsData?.bills.length ? (
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
                {t("Value")}
              </TableHead>
              <TableHead className="hidden md:table-cell rtl:text-right">
                {t("Description")}
              </TableHead>
              <TableHead className="hidden lg:table-cell rtl:text-right">
                {t("Remarks")}
              </TableHead>
              <TableHead className="hidden md:table-cell md:w-[60px] lg:w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? dummy.map((_, index) => RowSkeleton(index))
              : billsData.bills.map((bill: BillType) => Row(bill, deleteBill))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Bills;
