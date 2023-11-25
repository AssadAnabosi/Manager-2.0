import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const RowSkeleton = (key: number) => {
  return (
    <TableRow key={key} className="h-[73px]">
      <TableCell>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-[14px] w-[120px] leading-none " />
            <Skeleton className="h-[20px] w-[100px] " />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="hidden md:inline-block h-[25px] w-full rounded-full" />
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-[20px] w-[190px] leading-none " />
          <Skeleton className="h-[20px] w-[120px] " />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RowSkeleton;
