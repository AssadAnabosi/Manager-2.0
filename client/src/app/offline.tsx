import { useTranslation } from "react-i18next";

import Layout from "./layout";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const { t } = useTranslation();
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <Layout>
      <div className="flex justify-center items-center my-auto flex-col gap-6">
        <CloudOff
          className="text-[#3ea6ff]"
          size={256}
          strokeWidth={10}
          absoluteStrokeWidth
        />
        <p className="text-2xl text-center capitalize">
          {t("You are offline")}
        </p>
        <span className="pl-2 rtl:pr-2 text-xl text-center capitalize">
          {t("Please check your internet connection")}
        </span>
        <Button
          variant={"outline"}
          className="text-[#3ea6ff] hover:text-[#3ea6ff] mt-6"
          onClick={handleRefresh}
        >
          {t("Retry")}
        </Button>
      </div>
    </Layout>
  );
};

export default Unauthorized;
