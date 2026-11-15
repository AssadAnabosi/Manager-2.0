import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const SIZE = "w-[65px] sm:w-full sm:max-w-[65px] md:w-[65px] h-6";

/**
 * A green check or red cross pill. Coloured backgrounds don't survive printing, so on paper it
 * becomes a plain check or cross.
 */
const StatusBadge = ({
  status,
  labels,
}: {
  status: boolean;
  /** Already translated: what the check and the cross mean, for screen readers. */
  labels: [on: string, off: string];
}) => {
  const Icon = status ? Check : X;
  const label = status ? labels[0] : labels[1];
  return (
    <>
      <Badge
        variant={status ? "success" : "destructive"}
        className={`${SIZE} print:hidden`}
      >
        <Icon className="mx-auto size-[18px]" strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </Badge>
      <span className="hidden justify-center text-black print:inline-flex">
        <Icon className="size-[18px]" strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    </>
  );
};

export default StatusBadge;
