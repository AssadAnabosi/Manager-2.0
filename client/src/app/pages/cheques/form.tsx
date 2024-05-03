import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { ListType, ChequeType } from "@/lib/types";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/component/spinner";

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import ShekelIcon from "@/components/icons/shekel";

const ChequeForm = ({
  className,
  isDesktop,
  chequeForm,
  onSubmit,
  calendarOpen,
  setCalenderOpen,
  isLoading,
  cheque,
  filterLoading,
  payees,
  popoverOpen,
  setPopoverOpen,
}: {
  className?: string;
  isDesktop: boolean;
  chequeForm: any;
  onSubmit: any;
  calendarOpen: boolean;
  setCalenderOpen: any;
  isLoading: boolean;
  cheque?: ChequeType;
  filterLoading: boolean;
  payees: ListType[];
  popoverOpen: boolean;
  setPopoverOpen: any;
}) => {
  const { t } = useTranslation();
  const footerContent = (
    <Button type="submit" disabled={isLoading} className="md:w-[45%]">
      {isLoading ? (
        <Spinner className="h-4 w-4" />
      ) : cheque ? (
        t("Save Changes")
      ) : (
        t("Create")
      )}
    </Button>
  );
  return (
    <Form {...chequeForm}>
      <form
        className={cn(className, "space-y-4")}
        onSubmit={chequeForm.handleSubmit(onSubmit)}
      >
        <div className="flex gap-5">
          <FormField
            control={chequeForm.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("Due Date")}</FormLabel>
                <Popover open={calendarOpen} onOpenChange={setCalenderOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[245px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(stringToDate(field.value), "EEE, dd/LL/y", {
                            locale:
                              document.documentElement.lang === "ar"
                                ? ar
                                : enGB,
                          })
                        ) : (
                          <span>{t("Pick a date")}</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50 ltr:ml-auto rtl:mr-auto" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      captionLayout="dropdown-buttons"
                      fromYear={2019}
                      toYear={new Date().getFullYear() + 10}
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
            control={chequeForm.control}
            name="serial"
            render={({ field }) => (
              <FormItem className="relative flex flex-col">
                <FormLabel>{t("Serial No.")}</FormLabel>
                <FormControl>
                  <Input {...field} type="string" className="input" />
                </FormControl>
                <FormMessage className="absolute top-[60px]" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={chequeForm.control}
          name="payee"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Payee")}</FormLabel>
              {!filterLoading ? (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[245px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? payees.find((payee) => payee.value === field.value)
                              ?.label
                          : t("Select a payee")}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0">
                    <Command>
                      <CommandInput placeholder={t("Search...")} />
                      <CommandEmpty>{t("No matching results")}</CommandEmpty>
                      <ScrollArea>
                        <CommandGroup>
                          {payees.map((payee) => (
                            <CommandItem
                              className={cn(
                                "w-[98%]",
                                !payee.active
                                  ? "text-muted-foregroundF opacity-50"
                                  : ""
                              )}
                              disabled={!payee.active}
                              value={payee.label}
                              key={payee.value}
                              onSelect={() => {
                                if (payee.active) {
                                  chequeForm.getValues("payee") === payee.value
                                    ? chequeForm.setValue("payee", "")
                                    : chequeForm.setValue("payee", payee.value);
                                }
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  payee.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {payee.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <Skeleton className="h-10 w-[280px]" />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={chequeForm.control}
          name="value"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Value")}</FormLabel>
              <FormControl>
                <div className="relative w-full justify-between">
                  <span className="absolute bottom-0 left-3 top-0 my-auto h-6 w-6 text-muted-foreground">
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
          control={chequeForm.control}
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
        <FormField
          control={chequeForm.control}
          name="isCancelled"
          render={({ field }) => (
            <FormItem className="flex flex-col" dir="ltr">
              <FormControl>
                <label className="flex items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="ml-2">{t("Cancelled")}</span>
                </label>
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

export default ChequeForm;
