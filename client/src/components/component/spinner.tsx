import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Spinner = ({ className }: { className?: string }) => {
  return <Loader2 className={cn("h-8 w-8 animate-spin", className)} />;
};

export default Spinner;
