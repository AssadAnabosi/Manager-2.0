import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/theme-provider";
import { LanguageType, ThemeType, UserType } from "@/lib/types";
import { BootError, bootstrapSession, hasSessionHint } from "@/lib/session";
import AuthProviderContext, { AuthStatus } from "./auth-context";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | undefined>(undefined);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  // Only returning users have anything to wait for; everyone else starts anonymous.
  const [isBooting, setIsBooting] = useState(hasSessionHint);
  const [bootError, setBootError] = useState<BootError | undefined>(undefined);
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();

  const applyUser = useCallback(
    (user: UserType | null) => {
      if (!user) {
        setUser(undefined);
        return;
      }
      setTheme(user.theme as ThemeType);
      i18n.changeLanguage(user.language as LanguageType);
      setUser(user);
    },
    [setTheme, i18n]
  );

  useEffect(() => {
    let cancelled = false;
    bootstrapSession().then((result) => {
      if (cancelled) return;
      if (result.user) {
        setAccessToken(result.accessToken);
        applyUser(result.user);
      }
      setBootError(result.error);
      setIsBooting(false);
    });
    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  const status: AuthStatus = user
    ? "authenticated"
    : isBooting
      ? "loading"
      : "anonymous";

  const value = {
    status,
    bootError,
    user,
    setUser: applyUser,
    accessToken,
    setAccessToken,
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
};
