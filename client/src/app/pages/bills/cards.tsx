import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/utils";
import { Coins } from "lucide-react";

const Cards = ({
  billsData,
  isLoading,
}: {
  billsData: any;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        <>
          <Skeleton className="h-[146px]" />
          <Skeleton className="h-[146px]" />
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
              <CardTitle className="text-sm font-medium">
                {t("Range Sum")}
              </CardTitle>
              <Coins />
            </CardHeader>
            <CardContent>
              <div
                style={{ direction: "ltr" }}
                className="text-2xl font-bold rtl:text-right"
              >
                {typeof billsData?.rangeTotalValue !== "undefined"
                  ? currencyFormatter(billsData?.rangeTotalValue)
                  : "---"}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("Sum of all bills in the selected range.")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[72px]">
              <CardTitle className="text-sm font-medium">
                {t("Total Sum")}
              </CardTitle>
              <Coins />
            </CardHeader>
            <CardContent>
              <div
                style={{ direction: "ltr" }}
                className="text-2xl font-bold rtl:text-right"
              >
                {typeof billsData?.allTimeTotalValue !== "undefined"
                  ? currencyFormatter(billsData?.allTimeTotalValue)
                  : "---"}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("Sum of all bills ever.")}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Cards;
