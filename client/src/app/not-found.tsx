import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Layout from "./layout";
import { Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="flex justify-center items-center my-auto flex-col gap-6">
        <Unlink size={256} strokeWidth={10} absoluteStrokeWidth />
        <p className="uppercase tracking-[20px] text-red-600 text-3xl">
          error 404
        </p>
        <p className="text-2xl text-center capitalize">
          {t("The page you are looking for does not exist.")}
        </p>
        <span className="pl-2 rtl:pr-2 text-xl text-center capitalize">
          {t("Your adventure ends here, brave traveler.")}
        </span>
        <Button>
          <Link to="/">{t("Go back home")}</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
