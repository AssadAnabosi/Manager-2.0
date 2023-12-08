import { createContext, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/theme-provider";
import { LanguageType, ThemeType, UserType } from "@/lib/types";
import { axios } from "@/hooks/use-axios";

type AuthProviderState = {
  user: UserType | undefined;
  accessToken: string | undefined;
  setUser: (user: UserType | null) => void;
  setAccessToken: (accessToken: string) => void;
};

const initialState: AuthProviderState = {
  user: undefined,
  accessToken: undefined,
  setUser: () => null,
  setAccessToken: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | undefined>(() => {
    return undefined;
  });
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    return undefined;
  });
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();
  const value = {
    user,
    setUser: (user: UserType | null) => {
      if (!user) {
        setUser(undefined);
        return;
      }
      setTheme(user.theme as ThemeType);
      i18n.changeLanguage(user.language as LanguageType);
      setUser(user);
    },
    accessToken,
    setAccessToken: (accessToken: string) => {
      setAccessToken(accessToken);
    },
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const getAuth = async (accessToken: string) => {
  const { data: response } = await axios.get("/auth", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { data } = response;
  return data.user;
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
    }
  };
  return logout;
};

export default AuthProviderContext;
