import { useState } from "react";
import { apiErrorCode, apiErrorText } from "@/lib/api-error";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LogType } from "@/lib/types";
import { cn, getToday, stringToDate, toList } from "@/lib/utils";
import {
  logFormSchema,
  logFormSchemaType,
  useLogFormMutation,
} from "@/api/logs";
import { useGetUsersQuery } from "@/api/users";

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
import { ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

import Spinner from "@/components/component/spinner";

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import ShekelIcon from "@/components/icons/shekel";

type LogFormProps = {
  log?: LogType;
  /** Prefilled values for a new log. */
  defaults?: { worker?: string; date?: Date };
  /** Called after a successful save. */
  onDone: () => void;
};

const LogForm = ({ log, defaults, onDone }: LogFormProps) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { toast } = useToast();
  const logForm = useForm<logFormSchemaType>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      date: log ? new Date(log.date) : (defaults?.date ?? getToday()),
      worker: log?.worker?.id || defaults?.worker || undefined,
      startingTime: log?.startingTime || "08:30",
      finishingTime: log?.finishingTime || "16:30",
      isAbsent: log?.isAbsent || false,
      payment: log?.payment.toString() || "0",
      remarks: log?.remarks || "",
    },
  });
  const isLoading = logForm.formState.isSubmitting;

  const { data: usersData, isLoading: filterLoading } = useGetUsersQuery();
  const workers = toList(usersData?.users || [], "fullName", true);

  const { mutateAsync } = useLogFormMutation();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [calendarOpen, setCalenderOpen] = useState(false);

  const onSubmit = async (data: logFormSchemaType) => {
    try {
      if (log) {
        await mutateAsync({ data, logId: log.id });
      } else {
        await mutateAsync({ data });
        logForm.reset();
      }
      onDone();
    } catch (error: any) {
      if (apiErrorCode(error) === "LOG_EXISTS") {
        logForm.setError("date", {
          type: "manual",
          message: "This log already exists",
        });
        return;
      }
      toast({
        variant: "destructive",
        title: t("Error"),
        description: apiErrorText(error, t),
      });
    }
  };

  return (
    <Form {...logForm}>
      <form className="space-y-4" onSubmit={logForm.handleSubmit(onSubmit)}>
        <FormField
          control={logForm.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Date")}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalenderOpen} modal>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={log || isLoading ? true : false}
                      variant={"outline"}
                      className={cn(
                        "w-[280px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        fmt.date(stringToDate(field.value), "EEE, dd/LL/y")
                      ) : (
                        <span>{t("Pick a date")}</span>
                      )}
                      <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    disabled={log || isLoading ? true : false}
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
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <FormField
            control={logForm.control}
            name="startingTime"
            render={({ field }) => (
              <FormItem className="flex min-w-0 flex-col">
                <FormLabel>{t("Start Time")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input block min-w-0 appearance-none text-start"
                    type="time"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={logForm.control}
            name="finishingTime"
            render={({ field }) => (
              <FormItem className="flex min-w-0 flex-col">
                <FormLabel>{t("End Time")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input block min-w-0 appearance-none text-start"
                    type="time"
                    disabled={isLoading}
                  />
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
                        disabled={log || isLoading ? true : false}
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
                        disabled={log || isLoading ? true : false}
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
                  <span className="text-muted-foreground absolute start-3 top-0 bottom-0 my-auto h-6 w-6">
                    <ShekelIcon />
                  </span>
                  <Input
                    {...field}
                    type="string"
                    className="input pe-4 ps-12 text-start"
                    disabled={isLoading}
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
                <Textarea
                  {...field}
                  className="input resize-none"
                  disabled={isLoading}
                />
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
                    disabled={isLoading}
                  />
                  <span className="ml-2">{t("Absent")}</span>
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ResponsiveDialogFooter>
          <Button type="submit" disabled={isLoading} className="md:w-[45%]">
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : log ? (
              t("Save Changes")
            ) : (
              t("Create")
            )}
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </Form>
  );
};

export default LogForm;
