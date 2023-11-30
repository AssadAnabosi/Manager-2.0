import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "@/api/axios";

import { useAuth, useLogout, useRefreshToken } from "@/providers/auth-provider";
import { useError } from "@/providers/error-provider";

const useAxios = () => {
  const { accessToken, setAccessToken } = useAuth();
  const refreshToken = useRefreshToken();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { setError } = useError();

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
        } else {
          navigate("/", {
            state: { from: location },
            replace: true,
          });
          logout();
          setError({
            title: "Session Expired",
            description: "Please login again.",
          });
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
