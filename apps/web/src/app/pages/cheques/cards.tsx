import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/utils";
import { Coins, Tally5 } from "lucide-react";

const Cards = ({
  chequesData,
  isLoading,
}: {
  chequesData: any;
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
            <CardHeader className="flex h-[72px] flex-row items-center justify-between space-y-0 pb-2">
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
                {typeof chequesData?.total !== "undefined"
                  ? currencyFormatter(chequesData?.total)
                  : "---"}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("Sum of all cheques in the selected range.")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex h-[72px] flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Number of Cheques")}
              </CardTitle>
              <Tally5 />
            </CardHeader>
            <CardContent>
              <div
                style={{ direction: "ltr" }}
                className="text-2xl font-bold rtl:text-right"
              >
                {typeof chequesData?.number !== "undefined"
                  ? chequesData?.number
                  : "---"}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("Number of cheques in the selected range.")}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Cards;
