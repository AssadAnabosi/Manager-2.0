import { Badge } from "@/components/ui/badge";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

const StatusBadge = ({ status }: { status: boolean }) => {
  return (
    <>
      {status ? (
        <Badge
          variant="success"
          className="w-[65px] sm:w-full sm:max-w-[65px] md:w-[65px] h-[20px]"
        >
          <CheckIcon className="h-4 w-4 mx-auto" />
        </Badge>
      ) : (
        <Badge
          variant="destructive"
          className="w-[65px] sm:w-full sm:max-w-[65px] md:w-[65px] h-[20px]"
        >
          <Cross2Icon className="h-4 w-4 mx-auto" />
        </Badge>
      )}
    </>
  );
};

export default StatusBadge;
