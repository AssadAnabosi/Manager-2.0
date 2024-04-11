import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth, useRefreshToken, getAuth } from "@/providers/auth-provider";

import Loading from "../component/loading";
import { useError } from "@/providers/error-provider";

const PersistentLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const isLoggedIn = localStorage.getItem("isLoggedIn")?.toString() === "true";
  const { accessToken, setUser } = useAuth();
  const { setError } = useError();
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        const newAccessToken = await refresh();
        const user = await getAuth(newAccessToken);
        setUser(user);
      } catch (error: any) {
        if (error.code === "ERR_NETWORK") {
          setError({
            title: "Server unreachable",
            description: "Sorry, server unreachable at the moment.",
          });
        } else if (error.response.status === 401) {
          setError({
            title: "Session Expired",
            description: "Please login again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    !isLoggedIn || !accessToken ? verifyRefreshToken() : setIsLoading(false);
  }, []);

  return isLoading ? <Loading /> : <Outlet />;
};

export default PersistentLogin;
