import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth, useRefreshToken } from "@/providers/auth-provider";

import Loading from "../component/loading";
import { useError } from "@/providers/error-provider";

const PersistentLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { accessToken } = useAuth();
  const { setError } = useError();
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (error: any) {
        // error status === 401
        if (error.response.status === 401) {
          setError({
            title: "Session Expired",
            description: "Please login again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    !accessToken ? verifyRefreshToken() : setIsLoading(false);
  }, []);

  return isLoading ? <Loading /> : <Outlet />;
};

export default PersistentLogin;
