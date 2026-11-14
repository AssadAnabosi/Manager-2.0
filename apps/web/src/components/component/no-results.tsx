import { SearchX } from "lucide-react";

import { useTranslation } from "react-i18next";

const NoResults = () => {
  const { t } = useTranslation();
  return (
    <div className="align-center my-auto flex h-[335px] items-center justify-center">
      <SearchX size={32} absoluteStrokeWidth />
      <p className="ps-2 text-center text-2xl capitalize">
        {t("No Matching Results Found")}
      </p>
    </div>
  );
};

export default NoResults;
