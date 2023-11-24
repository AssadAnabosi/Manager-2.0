import { createContext, useState, useContext } from "react";

export type User = {
  id: string;
  username: string;
  role: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  theme: string;
  language: string;
};

type AuthProviderState = {
  user: User;
  setUser: (user: User) => void;
};

const initialState: AuthProviderState = {
  user: {} as User,
  setUser: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storageKey = "auth-user";
  const [user, setUser] = useState<User>(() => {
    if (localStorage.getItem(storageKey))
      return JSON.parse(localStorage.getItem(storageKey) as string) as User;
    return {} as User;
  });

  const value = {
    user,
    setUser: (user: User) => {
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
