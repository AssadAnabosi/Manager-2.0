import { Link } from "react-router-dom";

import Layout from "@/app/layout";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

const Unauthorized = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="flex justify-center items-center my-auto flex-col gap-6">
        <ShieldAlert
          className="text-warning"
          size={256}
          strokeWidth={10}
          absoluteStrokeWidth
        />
        <p className="uppercase tracking-[20px] text-warning text-3xl">
          error 403
        </p>
        <p className="text-2xl text-center capitalize">
          {t("You are not authorized to view this page.")}
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

export default Unauthorized;
