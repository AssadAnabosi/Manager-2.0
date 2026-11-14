/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ar, enGB } from "date-fns/locale";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps & { onChange?: React.ChangeEventHandler<HTMLSelectElement> }) {
  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  return (
    <DayPicker
      locale={document.documentElement.lang === "ar" ? ar : enGB}
      formatters={{
        formatCaption: (month, options) =>
          format(month, "LL y", { locale: options?.locale }),
        formatMonthCaption: (month, options) =>
          format(month, "LL", { locale: options?.locale }),
      }}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption_start: "is-start",
        caption_between: "is-between",
        caption_end: "is-end",
        caption: "flex justify-center pt-1 relative items-center gap-1",
        caption_label:
          "flex h-7 text-sm font-medium justify-center items-center grow [.is-multiple_&]:flex",
        caption_dropdowns: "flex justify-center gap-3 grow dropdowns pl-8 pr-9",
        multiple_months: "is-multiple",
        vhidden:
          "hidden [.is-between_&]:flex [.is-end_&]:flex [.is-start.is-end_&]:hidden",
        nav: "flex items-center [&:has([name='previous-month'])]:order-first [&:has([name='next-month'])]:order-last gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-muted-foreground"
        ),
        nav_button_previous: "absolute ltr:left-1 rtl:right-1",
        nav_button_next: "absolute ltr:right-1 rtl:left-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
          props.mode === "range"
            ? "ltr:[&:has(>.day-range-end)]:rounded-r-md rtl:[&:has(>.day-range-end)]:rounded-l-md ltr:[&:has(>.day-range-start)]:rounded-l-md rtl:[&:has(>.day-range-start)]:rounded-r-md ltr:first:[&:has([aria-selected])]:rounded-l-md rtl:first:[&:has([aria-selected])]:rounded-r-md ltr:last:[&:has([aria-selected])]:rounded-r-md rtl:last:[&:has([aria-selected])]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
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
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4 rtl:rotate-180" />,
        IconRight: () => <ChevronRight className="h-4 w-4 rtl:rotate-180" />,
        Dropdown: ({ ...props }) => (
          <Select
            {...props}
            onValueChange={(value) => {
              if (props.onChange) {
                handleCalendarChange(value, props.onChange);
              }
            }}
            value={props.value as string}
          >
            <SelectTrigger
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "pl-2 pr-1 py-2 h-7 border-none w-fit font-medium [.is-between_&]:hidden [.is-end_&]:hidden [.is-start.is-end_&]:flex"
              )}
            >
              <SelectValue placeholder={props?.caption}>
                {props?.caption}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {props.children &&
                React.Children.map(props.children, (child) => (
                  <SelectItem
                    value={(child as React.ReactElement<any>)?.props?.value}
                    className="min-w-[var(--radix-popper-anchor-width)]"
                  >
                    {(child as React.ReactElement<any>)?.props?.children}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
