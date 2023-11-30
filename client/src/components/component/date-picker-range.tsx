import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ar, enGB } from "date-fns/locale";
import { SelectRangeEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useTranslation } from "react-i18next";

type DatePickerWithRangeProps = {
  className?: string;
  date: {
    from: string | null | undefined;
    to?: string | null | undefined;
  };
  setDate: SelectRangeEventHandler | any;
};

export default function DatePickerWithRange({
  className,
  date: data,
  setDate,
}: DatePickerWithRangeProps) {
  const { t } = useTranslation();
  const date = {
    from: data.from ? new Date(data?.from) : undefined,
    to: data.to ? new Date(data?.to) : undefined,
  };
  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[335px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "EEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}{" "}
                  -{" "}
                  {format(date.to, "EEE, dd/LL/y", {
                    locale: document.documentElement.lang === "ar" ? ar : enGB,
                  })}
                </>
              ) : (
                format(date.from, "EEE, dd/LL/y,", {
                  locale: document.documentElement.lang === "ar" ? ar : enGB,
                })
              )
            ) : (
              <span>{t("Pick a date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
