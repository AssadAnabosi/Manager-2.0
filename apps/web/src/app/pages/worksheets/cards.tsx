import { useTranslation } from "react-i18next";
import { currencyFormatter, numberFormatter } from "@/lib/utils";
import { Coins, Clock8, Tally5 } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/component/stat-card";

const Cards = ({
  isLoading,
  logsData,
}: {
  isLoading: boolean;
  logsData: any;
}) => {
  const { t } = useTranslation();
  return (
    <StatCardGrid count={3} loading={isLoading}>
      <StatCard
        title={t("Days Worked")}
        value={logsData?.daysCount}
        hint={t("This does include days worked less than 8-hours.")}
        icon={Tally5}
      />
      <StatCard
        title={t("Received Payments")}
        value={
          typeof logsData?.paymentsSumValue !== "undefined"
            ? currencyFormatter(logsData.paymentsSumValue)
            : undefined
        }
        hint={t("Sum of all payments received.")}
        icon={Coins}
      />
      <StatCard
        title={t("Workday Variance: Balancing Hours")}
        value={
          typeof logsData?.OTVSum !== "undefined"
            ? numberFormatter(logsData.OTVSum)
            : undefined
        }
        hint={t(
          "Expected 8-hour workday; extra hours receive positive, fewer hours negative."
        )}
        icon={Clock8}
      />
    </StatCardGrid>
  );
};

export default Cards;
