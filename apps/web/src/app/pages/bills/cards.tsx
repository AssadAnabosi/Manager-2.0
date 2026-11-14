import { useTranslation } from "react-i18next";
import { currencyFormatter } from "@/lib/utils";
import { BillTotals } from "@/lib/types";
import { Coins } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/component/stat-card";

type Totals = { range?: BillTotals; allTime?: BillTotals };

const money = (value: number | undefined) =>
  typeof value !== "undefined" ? currencyFormatter(value) : undefined;

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
    <StatCardGrid count={4} loading={isLoading}>
      <StatCard
        title={t("Spent")}
        value={money(range?.spent)}
        hint={t("Total spent in the selected range.")}
        icon={Coins}
        tone="negative"
      />
      <StatCard
        title={t("Received")}
        value={money(range?.received)}
        hint={t("Total received in the selected range.")}
        icon={Coins}
        tone="positive"
      />
      <StatCard
        title={t("Net")}
        value={money(range?.net)}
        hint={t("Spent minus received in the selected range.")}
        icon={Coins}
      />
      <StatCard
        title={t("Total Net")}
        value={money(allTime?.net)}
        hint={t("Spent minus received, all time.")}
        icon={Coins}
      />
    </StatCardGrid>
  );
};

export default Cards;
