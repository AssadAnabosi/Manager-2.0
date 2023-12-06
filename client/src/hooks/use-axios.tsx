import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AXIOS from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const axios = AXIOS.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

import { useToast } from "@/components/ui/use-toast";

import { useAuth, useLogout, useRefreshToken } from "@/providers/auth-provider";
import { useError } from "@/providers/error-provider";

const useAxios = () => {
  const { t } = useTranslation();
  const { accessToken, setAccessToken } = useAuth();
  const refreshToken = useRefreshToken();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { setError } = useError();
  const { toast } = useToast();

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error?.config;

        if (error.code === "ERR_NETWORK") {
          toast({
            variant: "destructive",
            title: t("Network Error"),
            description: t("Cannot connect to server, please try again later."),
            duration: 5000,
          });
        } else {
          const refreshNeeded =
            error?.response.status === 403 &&
            error?.response.data.message ===
              "Token Expired, Please Refresh Token";
          if (refreshNeeded && !original.refreshed) {
            original.refreshed = true;
            try {
              const newAccessToken = await refreshToken();
              original.headers["Authorization"] = `Bearer ${newAccessToken}`;
              setAccessToken(newAccessToken);
              return axios(original);
            } catch (error) {
              return Promise.reject(error);
            }
          } else if (error.response.status === 401) {
            await logout();
            setError({
              title: "Session Expired",
              description: "Please login again.",
            });
            navigate("/", {
              state: { from: location },
              replace: true,
            });
          } else {
            return Promise.reject(error);
          }
        }
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken, setAccessToken, refreshToken]);

  return axios;
};

export default useAxios;
