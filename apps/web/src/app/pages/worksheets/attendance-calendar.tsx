import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LogType } from "@/lib/types";
import { useFormatters } from "@/hooks/use-locale";

import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogClose,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/component/status-badge";

type DayStatus = "worked" | "absent" | "none";

// a reference week, Sunday first, for the weekday header
const WEEK = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i));

const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

const STATUS_STYLE: Record<DayStatus, string> = {
  worked:
    "bg-green-500 text-white hover:bg-green-500/85 dark:bg-green-600 dark:hover:bg-green-600/85 print:text-black",
  absent:
    "bg-red-500 text-white hover:bg-red-500/85 dark:bg-red-600 dark:hover:bg-red-600/85 print:text-black",
  none: "bg-muted text-muted-foreground hover:bg-muted/70",
};

type Props = {
  /** The first day of the month shown. */
  month: Date;
  logs: LogType[];
  loading: boolean;
  onMonthChange: (month: Date) => void;
  /** When given, tapping a day with no record calls this instead of opening the details. */
  onAddDay?: (day: Date) => void;
};

/**
 * One worker's month at a glance: a day is green when they worked, red when absent, and gray
 * when there is no record. Tap a day for its hours, balance and payment.
 */
export default function AttendanceCalendar({
  month,
  logs,
  loading,
  onMonthChange,
  onAddDay,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [selected, setSelected] = useState<Date | null>(null);

  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const today = startOfDay(new Date());

  const byDay = useMemo(() => {
    // log dates are UTC midnights ("2026-11-13T00:00:00.000Z"): the date part is the day
    return new Map(logs.map((log) => [String(log.date).slice(0, 10), log]));
  }, [logs]);

  const days = eachDayOfInterval({ start: first, end: last });
  const statusOf = (d: Date): DayStatus => {
    const log = byDay.get(dayKey(d));
    if (!log) return "none";
    return log.isAbsent ? "absent" : "worked";
  };

  const stats = useMemo(() => {
    let worked = 0;
    let absent = 0;
    let balance = 0;
    for (const log of logs) {
      if (log.isAbsent) absent++;
      else worked++;
      balance += log.OTV;
    }
    return { worked, absent, balance };
  }, [logs]);

  // pad the first week so the 1st lands on its weekday (the week starts on Sunday)
  const lead = getDay(first);
  const selectedLog = selected ? byDay.get(dayKey(selected)) : undefined;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      {/* month navigation and range */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("Previous month")}
          onClick={() => onMonthChange(addMonths(first, -1))}
        >
          <ChevronLeft className="rtl:rotate-180" />
        </Button>
        <div className="text-center">
          <p className="text-lg font-semibold">{fmt.date(first, "LLLL y")}</p>
          <p className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
            {t("Calendar records")}{" "}
            <bdi dir="ltr">
              {fmt.date(first, "dd/LL/y")} - {fmt.date(last, "dd/LL/y")}
            </bdi>
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("Next month")}
          onClick={() => onMonthChange(addMonths(first, 1))}
        >
          <ChevronRight className="rtl:rotate-180" />
        </Button>
      </div>

      {/* stats */}
      <dl className="grid grid-cols-3 gap-2">
        {[
          { title: t("Days Worked"), value: stats.worked },
          { title: t("Days absent"), value: stats.absent },
          { title: t("Hours balance"), value: fmt.number(stats.balance) },
        ].map((s) => (
          <div key={s.title} className="bg-card rounded-lg border px-3 py-2">
            <dt className="text-muted-foreground text-xs">{s.title}</dt>
            <dd className="text-xl font-semibold tabular-nums" dir="ltr">
              {loading ? <Skeleton className="h-6 w-10" /> : s.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* weekday header and days */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid">
        {WEEK.map((d) => (
          <div
            key={getDay(d)}
            className="text-muted-foreground pb-1 text-center text-xs font-medium"
            role="columnheader"
          >
            {fmt.date(d, "EEEEEE")}
          </div>
        ))}
        {loading
          ? Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))
          : days.map((d, i) => {
              const status = statusOf(d);
              const future = isAfter(d, today);
              const isToday = isSameDay(d, today);
              const Icon =
                status === "worked" ? Check : status === "absent" ? X : null;
              return (
                <button
                  key={dayKey(d)}
                  type="button"
                  role="gridcell"
                  style={i === 0 ? { gridColumnStart: lead + 1 } : undefined}
                  onClick={() =>
                    status === "none" && onAddDay ? onAddDay(d) : setSelected(d)
                  }
                  aria-label={`${fmt.date(d)}, ${
                    status === "worked"
                      ? t("Attended")
                      : status === "absent"
                        ? t("Absent")
                        : t("No record")
                  }`}
                  className={cn(
                    "focus-visible:ring-ring/50 relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
                    STATUS_STYLE[status],
                    // empty and future days never print a border
                    future &&
                      "ring-border bg-transparent opacity-50 ring-1 print:ring-0",
                    isToday &&
                      "ring-foreground ring-offset-background ring-2 ring-offset-2"
                  )}
                >
                  <span>{fmt.date(d, "d")}</span>
                  {Icon && !future && (
                    <Icon
                      className="absolute bottom-1 size-3 opacity-90 print:size-4 print:opacity-100"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
      </div>

      {/* legend */}
      <ul className="text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs print:hidden">
        {(
          [
            ["worked", "Attended"],
            ["absent", "Absent"],
            ["none", "No record"],
          ] as const
        ).map(([status, name]) => (
          <li key={status} className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-3 rounded-[4px]",
                STATUS_STYLE[status].split(" ")[0]
              )}
            />
            {t(name)}
          </li>
        ))}
      </ul>

      {/* the tapped day */}
      <ResponsiveDialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {selected ? fmt.date(selected) : ""}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="sr-only">
              {t("Attendance details for this day")}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            {selectedLog ? (
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 text-start">
                <dt className="text-muted-foreground">{t("Status")}</dt>
                <dd>
                  <StatusBadge status={!selectedLog.isAbsent} />
                </dd>
                {!selectedLog.isAbsent && (
                  <>
                    <dt className="text-muted-foreground">{t("Work Hours")}</dt>
                    <dd dir="ltr" className="text-start">
                      {selectedLog.startingTime} - {selectedLog.finishingTime} (
                      {fmt.number(selectedLog.OTV)})
                    </dd>
                  </>
                )}
                <dt className="text-muted-foreground">{t("Payment")}</dt>
                <dd>{fmt.currency(selectedLog.payment)}</dd>
                {selectedLog.remarks && (
                  <>
                    <dt className="text-muted-foreground">{t("Remarks")}</dt>
                    <dd>{selectedLog.remarks}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground">
                {t("No record for this day.")}
              </p>
            )}
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <ResponsiveDialogClose asChild>
              <Button variant="outline">{t("Close")}</Button>
            </ResponsiveDialogClose>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </section>
  );
}
