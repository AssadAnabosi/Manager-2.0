import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLogout } from "@/providers/auth-context";
import { clearRememberedFilters } from "@/hooks/use-remembered-filters";

import Layout from "@/components/shell/bare-layout";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Logout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();
  useEffect(() => {
    const logoutUser = async () => {
      await logout();
      clearRememberedFilters();
      navigate("/", { replace: true });
    };
    logoutUser();
  }, []);
  return (
    <Layout>
      <div className="my-auto flex flex-col items-center justify-center gap-6">
        <LogOut size={256} strokeWidth={10} absoluteStrokeWidth />
        <p
          dir="ltr"
          className="text-3xl tracking-[20px] text-red-600 uppercase"
        >
          Good Bye!
        </p>
        <Button>
          <Link to="/">{t("Login again")}</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default Logout;
