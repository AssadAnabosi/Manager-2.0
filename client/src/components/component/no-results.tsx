import { SearchX } from "lucide-react";

import { useTranslation } from "react-i18next";

const NoResults = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{ direction: "ltr" }}
      className="flex justify-center items-center align-center my-auto h-[335px]"
    >
      <SearchX size={32} absoluteStrokeWidth />
      <p className="pl-2 text-2xl text-center capitalize">
        {t("No Matching Results Found")}
      </p>
    </div>
  );
};

export default NoResults;
