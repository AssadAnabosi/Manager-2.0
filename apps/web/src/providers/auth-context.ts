import { createContext, useContext } from "react";
import { UserType } from "@/lib/types";
import { axios } from "@/hooks/use-axios";
import { BootError, IS_LOGGED_IN_KEY } from "@/lib/session";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthProviderState = {
  status: AuthStatus;
  /** Why the boot-time session restore failed, if it did (shown once on the login page). */
  bootError: BootError | undefined;
  user: UserType | undefined;
  accessToken: string | undefined;
  setUser: (user: UserType | null) => void;
  setAccessToken: (accessToken: string) => void;
};

const initialState: AuthProviderState = {
  status: "loading",
  bootError: undefined,
  user: undefined,
  accessToken: undefined,
  setUser: () => null,
  setAccessToken: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useRefreshToken = () => {
  const { setAccessToken } = useAuth();
  const refresh = async () => {
    const { data: response } = await axios.post("/auth/refresh");
    const { data } = response;
    const accessToken = data.accessToken;
    setAccessToken(accessToken);
    return accessToken;
  };
  return refresh;
};

export const useLogout = () => {
  const { setUser, setAccessToken } = useAuth();
  const logout = async (callEndpoint = true) => {
    try {
      if (callEndpoint) await axios.delete("/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      setUser(null);
      setAccessToken("");
      localStorage.removeItem(IS_LOGGED_IN_KEY);
    }
  };
  return logout;
};

export default AuthProviderContext;
