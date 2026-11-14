import { DashboardIcon } from "@radix-ui/react-icons";

/**
 * Logo and name. Presentational on purpose: the boot skeleton renders it
 * without translations, so callers pass a translated `label` when they can.
 */
export function Brand({ label = "Dashboard" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <DashboardIcon className="h-6 w-6 shrink-0" />
      <span className="truncate text-xl font-bold">{label}</span>
    </div>
  );
}
