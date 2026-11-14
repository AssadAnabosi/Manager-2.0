import { useTranslation } from "react-i18next";

import Layout from "@/components/shell/bare-layout";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const { t } = useTranslation();
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <Layout>
      <div className="my-auto flex flex-col items-center justify-center gap-6">
        <WifiOff
          className="text-[#3ea6ff]"
          size={256}
          strokeWidth={10}
          absoluteStrokeWidth
        />
        <p className="text-center text-2xl capitalize">
          {t("You are offline")}
        </p>
        <span className="ps-2 text-center text-xl capitalize">
          {t("Please check your internet connection")}
        </span>
        <Button
          variant={"outline"}
          className="mt-6 text-[#3ea6ff] hover:text-[#3ea6ff]"
          onClick={handleRefresh}
        >
          {t("Retry")}
        </Button>
      </div>
    </Layout>
  );
};

export default Unauthorized;
