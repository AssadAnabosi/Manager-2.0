import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { ListType, LogType } from "@/lib/types";
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
import { ScrollArea as CB_ScrollArea } from "@/components/component/cb-scroll-area";
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

const LogForm = ({
  className,
  isDesktop,
  logForm,
  onSubmit,
  calendarOpen,
  setCalenderOpen,
  isLoading,
  log,
  filterLoading,
  workers,
  popoverOpen,
  setPopoverOpen,
}: {
  className?: string;
  isDesktop: boolean;
  logForm: any;
  onSubmit: any;
  calendarOpen: boolean;
  setCalenderOpen: any;
  isLoading: boolean;
  log?: LogType;
  filterLoading: boolean;
  workers: ListType[];
  popoverOpen: boolean;
  setPopoverOpen: any;
}) => {
  const { t } = useTranslation();
  const footerContent = (
    <Button type="submit" disabled={isLoading} className="md:w-[45%]">
      {isLoading ? (
        <Spinner className="h-4 w-4" />
      ) : log ? (
        t("Save Changes")
      ) : (
        t("Create")
      )}
    </Button>
  );
  return (
    <Form {...logForm}>
      <form
        className={cn(className, "space-y-4")}
        onSubmit={logForm.handleSubmit(onSubmit)}
      >
        <FormField
          control={logForm.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Date")}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalenderOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={log ? true : false}
                      variant={"outline"}
                      className={cn(
                        "w-[280px] pl-3 text-left font-normal",
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
                      <CalendarIcon className="h-4 w-4 opacity-50 ltr:ml-auto rtl:mr-auto" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    disabled={log ? true : false}
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={logForm.control}
            name="startingTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("Start Time")}</FormLabel>
                <FormControl>
                  <Input {...field} className="input" type="time" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={logForm.control}
            name="finishingTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("End Time")}</FormLabel>
                <FormControl>
                  <Input {...field} className="input" type="time" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={logForm.control}
          name="worker"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Worker")}</FormLabel>
              {!filterLoading ? (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={log ? true : false}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[280px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? workers.find(
                              (worker) => worker.value === field.value
                            )?.label
                          : t("Select a worker")}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0">
                    <Command>
                      <CommandInput
                        className="text-md"
                        placeholder={t("Search...")}
                      />
                      <CommandEmpty>{t("No matching results")}</CommandEmpty>
                      <CB_ScrollArea>
                        <CommandGroup>
                          {workers.map((worker) => (
                            <CommandItem
                              className={cn(
                                "w-[98%]",
                                !worker.active
                                  ? "text-muted-foregroundF opacity-50"
                                  : ""
                              )}
                              disabled={!worker.active}
                              value={worker.label}
                              key={worker.value}
                              onSelect={() => {
                                if (worker.active) {
                                  logForm.getValues("worker") === worker.value
                                    ? logForm.setValue("worker", "")
                                    : logForm.setValue("worker", worker.value);
                                }
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  worker.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {worker.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CB_ScrollArea>
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
          control={logForm.control}
          name="payment"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Payment")}</FormLabel>
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
          control={logForm.control}
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
          control={logForm.control}
          name="isAbsent"
          render={({ field }) => (
            <FormItem className="flex flex-col" dir="ltr">
              <FormControl>
                <label className="flex items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="ml-2">{t("Absent")}</span>
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

export default LogForm;
