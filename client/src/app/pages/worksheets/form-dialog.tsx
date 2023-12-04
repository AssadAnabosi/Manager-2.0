import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { LogType } from "@/lib/types";

import {
  logFormSchema,
  logFormSchemaType,
  useLogFormMutation,
} from "@/api/logs";
import { useGetUsersQuery } from "@/api/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import Spinner from "@/components/component/spinner";

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import ShekelIcon from "@/components/icons/shekel";

import { cn, stringToDate, getToday, toList } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type ComponentProps = {
  children: ReactNode;
  log?: LogType;
  onClose?: (status: boolean) => void;
};

export default function FormDialog({ children, log, onClose }: ComponentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const logForm = useForm<logFormSchemaType>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      date: log ? new Date(log?.date) : getToday(),
      worker: log?.worker?.id || undefined,
      startingTime: log?.startingTime || "08:30",
      finishingTime: log?.finishingTime || "16:30",
      isAbsent: log?.isAbsent || false,
      payment: log?.payment.toString() || "",
      remarks: log?.remarks || "",
    },
  });
  const isLoading = logForm.formState.isSubmitting;

  const { data: usersData, isLoading: filterLoading } = useGetUsersQuery();
  const workers = toList(usersData?.users || [], "fullName", true);

  const { mutateAsync } = useLogFormMutation();
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: logFormSchemaType) => {
    try {
      if (log) {
        await mutateAsync({ data, logId: log.id });
      } else {
        await mutateAsync({ data });
        logForm.reset();
      }
      setOpen(false);
      onClose?.(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{log ? t("Edit Log") : t("New Log")}</DialogTitle>
          <DialogDescription>
            {log
              ? t("Edit the log details")
              : t("Enter the details for the new log")}
          </DialogDescription>
        </DialogHeader>
        <Form {...logForm}>
          <form onSubmit={logForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={logForm.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Date")}</FormLabel>
                  <Popover>
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
                                document.documentElement.lang === "ar"
                                  ? ar
                                  : enGB,
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
                        disabled={log ? true : false}
                        mode="single"
                        selected={stringToDate(field.value)}
                        onSelect={field.onChange}
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
                    <FormLabel>{t("Starting Time")}</FormLabel>
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
                    <FormLabel>{t("Finishing Time")}</FormLabel>
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
                    <Popover>
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
                              : "Select worker"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Search worker..." />
                          <CommandEmpty>
                            {t("No matching results")}
                          </CommandEmpty>
                          <CommandGroup>
                            {workers.map((worker) => (
                              <CommandItem
                                className={
                                  !worker.active
                                    ? "opacity-50 text-muted-foregroundF"
                                    : ""
                                }
                                disabled={!worker.active}
                                value={worker.label}
                                key={worker.value}
                                onSelect={() => {
                                  if (worker.active) {
                                    logForm.getValues("worker") === worker.value
                                      ? logForm.setValue("worker", "")
                                      : logForm.setValue(
                                          "worker",
                                          worker.value
                                        );
                                  }
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
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Skeleton className="w-[280px] h-10" />
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
                <FormItem className="flex flex-col">
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="md:w-[45%]">
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : log ? (
                  t("Save Changes")
                ) : (
                  t("Create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
