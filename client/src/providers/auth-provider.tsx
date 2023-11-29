import { createContext, useState, useContext } from "react";
import { UserType } from "@/lib/types";

type AuthProviderState = {
  user: UserType | undefined;
  setUser: (user: UserType) => void;
};

const initialState: AuthProviderState = {
  user: undefined,
  setUser: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storageKey = "auth-user";
  const [user, setUser] = useState<UserType | undefined>(() => {
    if (localStorage.getItem(storageKey))
      return JSON.parse(localStorage.getItem(storageKey) as string) as UserType;
    return undefined;
  });

  const value = {
    user,
    setUser: (user: UserType) => {
      localStorage.setItem(storageKey, JSON.stringify(user));
      setUser(user);
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

export default AuthProviderContext;
