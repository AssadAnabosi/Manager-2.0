import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter, numberFormatter } from "@/lib/utils";
import { Coins, Clock8, Tally5 } from "lucide-react";

const Cards = ({
  isLoading,
  logsData,
}: {
  isLoading: boolean;
  logsData: any;
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {isLoading ? (
        <>
          <Skeleton className="h-[146px]" />
          <Skeleton className="h-[146px]" />
          <Skeleton className="h-[146px]" />
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
              <CardTitle className="text-sm font-medium">
                {t("Days Worked")}
              </CardTitle>
              <Tally5 />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof logsData?.daysCount !== "undefined"
                  ? logsData.daysCount
                  : "---"}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("This does include days worked less than 8-hours.")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
              <CardTitle className="text-sm font-medium">
                {t("Received Payments")}
              </CardTitle>
              <Coins />
            </CardHeader>
            <CardContent>
              <div
                style={{ direction: "ltr" }}
                className="text-2xl font-bold rtl:text-right"
              >
                {typeof logsData?.paymentsSumValue !== "undefined"
                  ? currencyFormatter(logsData.paymentsSumValue)
                  : "---"}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("Sum of all payments received.")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
              <CardTitle className="text-sm font-medium">
                {t("Workday Variance: Balancing Hours")}
              </CardTitle>
              <Clock8 />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof logsData?.OTVSum !== "undefined"
                  ? numberFormatter(logsData.OTVSum)
                  : "---"}
              </div>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Expected 8-hour workday; extra hours receive positive, fewer hours negative."
                )}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Cards;
