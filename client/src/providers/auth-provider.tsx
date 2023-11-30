import { createContext, useState, useContext } from "react";
import { UserType } from "@/lib/types";
import axios from "@/api/axios";

type AuthProviderState = {
  user: UserType | undefined;
  accessToken: string | undefined;
  setUser: (user: UserType) => void;
  setAccessToken: (accessToken: string) => void;
};

const initialState: AuthProviderState = {
  user: {} as UserType,
  accessToken: undefined,
  setUser: () => null,
  setAccessToken: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // const storageKey = "auth-user";
  const [user, setUser] = useState<UserType | undefined>(() => {
    // if (localStorage.getItem(storageKey))
    //   return JSON.parse(localStorage.getItem(storageKey) as string) as UserType;
    return undefined;
  });
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    return undefined;
  });

  const value = {
    user,
    setUser: (user: UserType) => {
      // localStorage.setItem(storageKey, JSON.stringify(user));
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

export const useRefreshToken = () => {
  const { setAccessToken } = useAuth();
  const refresh = async () => {
    const { data: response } = await axios.get("/auth/refresh");
    const { data } = response;
    setAccessToken(data.accessToken);
    return data.accessToken;
  };
  return refresh;
};

export default AuthProviderContext;
