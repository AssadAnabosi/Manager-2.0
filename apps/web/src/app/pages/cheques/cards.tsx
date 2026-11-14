import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { Coins, Tally5 } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/component/stat-card";

const Cards = ({
  chequesData,
  isLoading,
}: {
  chequesData: any;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  return (
    <StatCardGrid count={2} loading={isLoading}>
      <StatCard
        title={t("Total Sum")}
        value={
          typeof chequesData?.total !== "undefined"
            ? fmt.currency(chequesData.total)
            : undefined
        }
        hint={t("Sum of all cheques in the selected range.")}
        icon={Coins}
      />
      <StatCard
        title={t("Number of Cheques")}
        value={chequesData?.number}
        hint={t("Number of cheques in the selected range.")}
        icon={Tally5}
      />
    </StatCardGrid>
  );
};

export default Cards;
