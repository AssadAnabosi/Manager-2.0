import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Layout from "@/components/shell/bare-layout";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="my-auto flex flex-col items-center justify-center gap-6">
        <ShieldAlert
          className="text-warning"
          size={256}
          strokeWidth={10}
          absoluteStrokeWidth
        />
        <p className="text-warning text-3xl tracking-[20px] uppercase">
          error 403
        </p>
        <p className="text-center text-2xl capitalize">
          {t("You are not authorized to view this page.")}
        </p>
        <span className="ps-2 text-center text-xl capitalize">
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
