import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { BillType } from "@/lib/types";

import { cn, stringToDate } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/component/spinner";

import { CalendarIcon } from "lucide-react";
import ShekelIcon from "@/components/icons/shekel";

const BillForm = ({
  className,
  isDesktop,
  billForm,
  onSubmit,
  calendarOpen,
  setCalenderOpen,
  isLoading,
  bill,
}: {
  className?: string;
  isDesktop: boolean;
  billForm: any;
  onSubmit: any;
  calendarOpen: boolean;
  setCalenderOpen: any;
  isLoading: boolean;
  bill?: BillType;
}) => {
  const { t } = useTranslation();
  const footerContent = (
    <Button type="submit" disabled={isLoading} className="md:w-[45%]">
      {isLoading ? (
        <Spinner className="h-4 w-4" />
      ) : bill ? (
        t("Save Changes")
      ) : (
        t("Create")
      )}
    </Button>
  );
  return (
    <Form {...billForm}>
      <form
        className={cn(className, "space-y-4")}
        onSubmit={billForm.handleSubmit(onSubmit)}
      >
        <FormField
          control={billForm.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Date")}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalenderOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(stringToDate(field.value), "EEE, dd/LL/y", {
                          locale:
                            document.documentElement.lang === "ar" ? ar : enGB,
                        })
                      ) : (
                        <span>{t("Pick a date")}</span>
                      )}
                      <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    captionLayout="dropdown-buttons"
                    fromYear={2024}
                    toYear={new Date().getFullYear() + 5}
                    defaultMonth={stringToDate(field.value)}
                    mode="single"
                    selected={stringToDate(field.value)}
                    onSelect={(e) => {
                      field.onChange(e);
                      setCalenderOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={billForm.control}
          name="value"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Value")}</FormLabel>
              <FormControl>
                <div className="relative w-full justify-between">
                  <span className="absolute top-0 bottom-0 w-6 h-6 my-auto text-muted-foreground left-3">
                    <ShekelIcon />
                  </span>
                  <Input
                    {...field}
                    type="string"
                    className="input pl-12 pr-4 text-left"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={billForm.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Description")}</FormLabel>
              <FormControl>
                <Input {...field} type="string" className="input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={billForm.control}
          name="remarks"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Remarks")}</FormLabel>
              <FormControl>
                <Textarea {...field} className="input resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isDesktop ? (
          <DialogFooter>{footerContent}</DialogFooter>
        ) : (
          <DrawerFooter className="pt-2">{footerContent}</DrawerFooter>
        )}
      </form>
    </Form>
  );
};

export default BillForm;
