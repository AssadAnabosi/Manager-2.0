import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const RowSkeleton = (key: number) => {
  return (
    <TableRow key={key} className="h-[73px]">
      <TableCell>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-[14px] w-[100px] leading-none " />
            <Skeleton className="h-[20px] w-[120px] " />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="space-y-1">
          <Skeleton className="h-[20px] w-[100px] leading-none " />
          <Skeleton className="h-[20px] w-[120px] " />
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-5 w-[120px] rounded-full " />
      </TableCell>
      <TableCell className="hidden md:table-cell"></TableCell>
    </TableRow>
  );
};

export default RowSkeleton;
