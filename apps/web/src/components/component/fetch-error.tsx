import { XCircle } from "lucide-react";

import { useTranslation } from "react-i18next";

const FetchError = () => {
  const { t } = useTranslation();
  return (
    <div className="align-center my-auto flex h-[335px] items-center justify-center">
      <XCircle size={48} absoluteStrokeWidth className="text-destructive" />
      <p className="px-2 text-center text-2xl capitalize">
        {t("Something went wrong, please try again later.")}
      </p>
    </div>
  );
};

export default FetchError;
