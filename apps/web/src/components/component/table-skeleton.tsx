import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type SkeletonColumn = {
  /**
   * identity: avatar with two text lines (one with `single`);
   * badge: a short pill; text: a full-width bar; lines: two stacked bars;
   * empty: reserves the cell (action columns).
   */
  kind: "identity" | "identity-single" | "badge" | "text" | "lines" | "empty";
  /** Responsive visibility, e.g. "hidden md:table-cell". */
  className?: string;
};

function Cell({ kind }: Pick<SkeletonColumn, "kind">) {
  switch (kind) {
    case "identity":
    case "identity-single":
      return (
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          {kind === "identity" ? (
            <div className="space-y-1">
              <Skeleton className="h-[18px] w-[110px]" />
              <Skeleton className="h-[20px] w-[110px]" />
            </div>
          ) : (
            <Skeleton className="h-[18px] w-[100px]" />
          )}
        </div>
      );
    case "badge":
      return <Skeleton className="h-5 w-[65px] rounded-full" />;
    case "text":
      return <Skeleton className="h-5 w-full max-w-[185px] rounded-full" />;
    case "lines":
      return (
        <div className="space-y-1">
          <Skeleton className="h-[20px] w-[150px]" />
          <Skeleton className="h-[14px] w-[110px]" />
        </div>
      );
    case "empty":
      return null;
  }
}

type TableSkeletonProps = {
  rows?: number;
  columns: SkeletonColumn[];
};

/** Placeholder rows matching a list page's columns. Render inside `TableBody`. */
export function TableSkeleton({ rows = 8, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row} className="h-[73px]">
          {columns.map((column, i) => (
            <TableCell key={i} className={cn(column.className)}>
              <Cell kind={column.kind} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
