import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, currencyFormatter } from "@/lib/utils";
import { BillTotals } from "@/lib/types";
import { Coins } from "lucide-react";

type Totals = { range?: BillTotals; allTime?: BillTotals };

const StatCard = ({
  title,
  value,
  description,
  className,
}: {
  title: string;
  value: number | undefined;
  description: string;
  className?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Coins />
    </CardHeader>
    <CardContent>
      <div
        style={{ direction: "ltr" }}
        className={cn("text-2xl font-bold rtl:text-right", className)}
      >
        {typeof value !== "undefined" ? currencyFormatter(value) : "---"}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Cards = ({
  billsData,
  isLoading,
}: {
  billsData: { totals?: Totals } | undefined;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const range = billsData?.totals?.range;
  const allTime = billsData?.totals?.allTime;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        <>
          <Skeleton className="h-[146px]" />
          <Skeleton className="h-[146px]" />
          <Skeleton className="h-[146px]" />
          <Skeleton className="h-[146px]" />
        </>
      ) : (
        <>
          <StatCard
            title={t("Spent")}
            value={range?.spent}
            description={t("Total spent in the selected range.")}
            className="text-red-600 dark:text-red-400"
          />
          <StatCard
            title={t("Received")}
            value={range?.received}
            description={t("Total received in the selected range.")}
            className="text-green-600 dark:text-green-400"
          />
          <StatCard
            title={t("Net")}
            value={range?.net}
            description={t("Spent minus received in the selected range.")}
          />
          <StatCard
            title={t("Total Net")}
            value={allTime?.net}
            description={t("Spent minus received, all time.")}
          />
        </>
      )}
    </div>
  );
};

export default Cards;
