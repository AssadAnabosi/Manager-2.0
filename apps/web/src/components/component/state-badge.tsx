import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * A word in an outlined pill, coloured like the Spent / Received type of a bill: green when on,
 * red (or a quiet gray, for things that are only a preference) when off.
 */
const StateBadge = ({
  on,
  labels,
  offTone = "danger",
}: {
  on: boolean;
  /** Already translated: what it says when on and when off. */
  labels: [on: string, off: string];
  offTone?: "danger" | "muted";
}) => (
  <Badge
    variant="outline"
    className={cn(
      "h-[25px] min-w-[84px] px-3 text-sm font-medium",
      on
        ? "text-green-600 dark:text-green-400"
        : offTone === "danger"
          ? "text-red-600 dark:text-red-400"
          : "text-muted-foreground"
    )}
  >
    {on ? labels[0] : labels[1]}
  </Badge>
);

export default StateBadge;
