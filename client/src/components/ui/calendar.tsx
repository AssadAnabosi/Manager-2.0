/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";
import { ar, enGB } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={document.documentElement.lang === "ar" ? ar : enGB}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: `text-sm font-medium ${
          props.mode === "single" ? "hidden" : ""
        }`,
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute ltr:left-1 rtl:right-1",
        nav_button_next: "absolute ltr:right-1 rtl:left-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative ltr:[&:has([aria-selected].day-range-end)]:rounded-r-md rtl:[&:has([aria-selected].day-range-end)]:rounded-l-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent ltr:first:[&:has([aria-selected])]:rounded-l-md rtl:first:[&:has([aria-selected])]:rounded-r-md ltr:last:[&:has([aria-selected])]:rounded-r-md rtl:last:[&:has([aria-selected])]:rounded-l-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-warning-foreground text-warning",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        caption_dropdowns:
          "flex gap-1 ltr:flex-row rtl:flex-row-reverse items-center",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4 rtl:rotate-180" />,
        IconRight: () => <ChevronRight className="h-4 w-4 rtl:rotate-180" />,
        Dropdown: (props) => {
          const { fromDate, fromMonth, fromYear, toDate, toMonth, toYear } =
            useDayPicker();
          const { goToMonth, currentMonth } = useNavigation();
          if (props.name === "months") {
            const selectItems = Array.from({ length: 12 }, (_, index) => ({
              value: index.toString(),
              label: (index + 1).toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }),
            }));
            return (
              <Select
                onValueChange={(newValue) => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(parseInt(newValue));
                  goToMonth(newDate);
                }}
                value={props.value?.toString()}
              >
                <SelectTrigger className="border-none">
                  {(currentMonth.getMonth() + 1).toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  })}
                </SelectTrigger>
                <SelectContent>
                  {selectItems.map((selectItem) => (
                    <SelectItem key={selectItem.value} value={selectItem.value}>
                      {selectItem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          } else if (props.name === "years") {
            const earliestYear =
              fromYear || fromMonth?.getFullYear() || fromDate?.getFullYear();
            const latestYear =
              toYear || toMonth?.getFullYear() || toDate?.getFullYear();
            let selectItems: { label: string; value: string }[] = [];
            if (earliestYear && latestYear) {
              const yearsLength = latestYear - earliestYear + 1;
              selectItems = Array.from({ length: yearsLength }, (_, index) => ({
                value: (earliestYear + index).toString(),
                label: (earliestYear + index).toLocaleString("en-US", {
                  useGrouping: false,
                }),
              }));
            }
            return (
              <Select
                onValueChange={(newValue) => {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(parseInt(newValue));
                  goToMonth(newDate);
                }}
                value={props.value?.toString()}
              >
                <SelectTrigger className="border-none">
                  {currentMonth.getFullYear().toString()}
                </SelectTrigger>
                <SelectContent>
                  {selectItems.map((selectItem) => (
                    <SelectItem key={selectItem.value} value={selectItem.value}>
                      {selectItem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }
          return null;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
