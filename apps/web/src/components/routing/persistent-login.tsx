import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from "@/providers/auth-context";
import { useError } from "@/providers/error-provider";

import AppShellSkeleton from "../component/app-shell-skeleton";

/**
 * Holds guarded routes until the boot-time session restore settles, so they
 * don't bounce to the login page. Only returning users ever wait here: for
 * anyone else the status is "anonymous" from the first render.
 */
const PersistentLogin = () => {
  const { status, bootError } = useAuth();
  const { setError } = useError();

  useEffect(() => {
    if (bootError) setError(bootError);
  }, [bootError, setError]);

  return status === "loading" ? <AppShellSkeleton /> : <Outlet />;
};

export default PersistentLogin;
