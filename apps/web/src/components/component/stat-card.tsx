import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TONES = {
  neutral: "",
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
} as const;

type StatCardProps = {
  title: string;
  /** Already formatted; `undefined` renders a placeholder. */
  value: string | number | undefined;
  hint: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: StatCardProps) {
  return (
    <Card className="gap-1 py-5">
      <CardHeader className="flex h-10 flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon />
      </CardHeader>
      <CardContent>
        <div
          dir="ltr"
          className={cn("text-2xl font-bold rtl:text-right", TONES[tone])}
        >
          {typeof value !== "undefined" ? value : "---"}
        </div>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
}

const COLUMNS = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
} as const;

type StatCardGridProps = {
  /** Number of cards; also the number of skeletons while loading. */
  count: keyof typeof COLUMNS;
  loading: boolean;
  children: ReactNode;
};

export function StatCardGrid({ count, loading, children }: StatCardGridProps) {
  return (
    <div className={cn("grid gap-4", COLUMNS[count])}>
      {loading
        ? Array.from({ length: count }, (_, i) => (
            <Skeleton key={i} className="h-[146px]" />
          ))
        : children}
    </div>
  );
}
