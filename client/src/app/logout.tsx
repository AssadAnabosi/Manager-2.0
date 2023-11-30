import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLogout } from "@/providers/auth-provider";

import Layout from "./layout";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Logout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();
  useEffect(() => {
    logout();
    navigate("/", { replace: true });
  }, []);
  return (
    <Layout>
      <div className="flex justify-center items-center my-auto flex-col gap-6">
        <LogOut size={256} strokeWidth={10} absoluteStrokeWidth />
        <p className="uppercase tracking-[20px] text-red-600 text-3xl">
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
