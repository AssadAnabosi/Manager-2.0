import { createContext, useContext, useEffect, useState } from "react";
import { ThemeType } from "@/lib/types";
import { useAuth } from "./auth-provider";

export type { ThemeType } from "@/lib/types";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeType>(
    () =>
      (localStorage.getItem(storageKey) as ThemeType) ||
      user?.theme ||
      defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: ThemeType) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
