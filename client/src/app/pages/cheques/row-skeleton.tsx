import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const RowSkeleton = (key: number) => {
  return (
    <TableRow key={key} className="h-[73px]">
      <TableCell>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-[18px] w-[100px] leading-none " />
            <Skeleton className="h-[20px] w-[130px] " />
          </div>
        </div>
      </TableCell>
      <TableCell className="table-cell ">
        <Skeleton className="h-5 w-[85px] rounded-full " />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-5 w-full max-w-[185px] rounded-full " />
      </TableCell>
      <TableCell className="hidden md:table-cell"></TableCell>
    </TableRow>
  );
};

export default RowSkeleton;
