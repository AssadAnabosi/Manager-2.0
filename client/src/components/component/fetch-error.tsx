import { XCircle } from "lucide-react";

import { useTranslation } from "react-i18next";

const FetchError = () => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center items-center align-center my-auto h-[335px]">
      <XCircle size={48} absoluteStrokeWidth className="text-destructive" />
      <p className="pl-2 rtl:pr-2 text-2xl text-center capitalize">
        {t("Something went wrong, please try again later.")}
      </p>
    </div>
  );
};

export default FetchError;
