import { CalendarIcon } from "@radix-ui/react-icons";
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
import { useFormatters } from "@/hooks/use-locale";

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
  const fmt = useFormatters();
  const date = {
    from: data.from ? new Date(data?.from) : undefined,
    to: data.to ? new Date(data?.to) : undefined,
  };
  return (
    <div className={cn("grid w-full gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal md:w-[335px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="me-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {fmt.date(date.from, "EEE, dd/LL/y")} -{" "}
                  {fmt.date(date.to, "EEE, dd/LL/y")}
                </>
              ) : (
                fmt.date(date.from, "EEE, dd/LL/y,")
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
            captionLayout="dropdown-buttons"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            fromYear={2019}
            toYear={new Date().getFullYear() + 10}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
