import axios from "@/api/axios";

import { useEffect } from "react";
import { useAuth, useRefreshToken } from "@/providers/auth-provider";

const useAxios = () => {
  const { accessToken, setAccessToken } = useAuth();
  const refreshToken = useRefreshToken();

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

        const refreshNeeded =
          error.response.status === 403 &&
          error.response.data.message === "Token Expired, Please Refresh Token";

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
