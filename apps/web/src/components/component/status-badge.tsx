import { Badge } from "@/components/ui/badge";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

const SIZE = "w-[65px] sm:w-full sm:max-w-[65px] md:w-[65px] h-[20px]";

/**
 * A green check or red cross pill. Coloured backgrounds don't survive printing, so on paper it
 * becomes a plain check or cross.
 */
const StatusBadge = ({ status }: { status: boolean }) => {
  const Icon = status ? CheckIcon : Cross2Icon;
  return (
    <>
      <Badge
        variant={status ? "success" : "destructive"}
        className={`${SIZE} print:hidden`}
      >
        <Icon className="mx-auto h-4 w-4" />
      </Badge>
      <span className="hidden justify-center text-black print:inline-flex">
        <Icon className="h-4 w-4" />
      </span>
    </>
  );
};

export default StatusBadge;
