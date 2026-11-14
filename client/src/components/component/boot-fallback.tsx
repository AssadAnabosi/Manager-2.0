import { hasSessionHint } from "@/lib/session";
import AppShellSkeleton from "./app-shell-skeleton";
import Loading from "./loading";

/** Returning users see the app shell loading in place; everyone else gets the splash. */
const BootFallback = () =>
  hasSessionHint() ? <AppShellSkeleton /> : <Loading />;

export default BootFallback;
