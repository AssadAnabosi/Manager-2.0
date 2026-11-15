import { useState } from "react";
import { apiErrorCode, apiValidationIssues } from "@/lib/api-error";
import { apiErrorText } from "@/lib/api-error";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChequeType } from "@/lib/types";
import {
  cn,
  getLastDayOfCurrentMonthDate,
  stringToDate,
  toList,
} from "@/lib/utils";
import {
  chequeFormSchema,
  chequeFormSchemaType,
  useChequeFormMutation,
} from "@/api/cheques";
import { useGetPayeesQuery } from "@/api/payees";

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

type ChequeFormProps = {
  cheque?: ChequeType;
  defaults?: { serial?: string };
  /** Called after a successful save. */
  onDone: () => void;
};

const ChequeForm = ({ cheque, defaults, onDone }: ChequeFormProps) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { toast } = useToast();
  const chequeForm = useForm<chequeFormSchemaType>({
    resolver: zodResolver(chequeFormSchema),
    defaultValues: {
      dueDate: cheque
        ? new Date(cheque.dueDate)
        : getLastDayOfCurrentMonthDate(),
      payee: cheque?.payee?.id || undefined,
      serial: cheque?.serial.toString() || defaults?.serial || "",
      value: cheque?.value.toString() || "",
      isCancelled: cheque?.isCancelled || false,
      remarks: cheque?.remarks || "",
    },
  });
  const isLoading = chequeForm.formState.isSubmitting;

  const { data: payeesData, isLoading: filterLoading } = useGetPayeesQuery();
  const payees = toList(payeesData?.payees || [], "name");

  const { mutateAsync } = useChequeFormMutation();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [calendarOpen, setCalenderOpen] = useState(false);

  const onSubmit = async (data: chequeFormSchemaType) => {
    try {
      if (cheque) {
        await mutateAsync({ data, chequeId: cheque.id });
      } else {
        await mutateAsync({ data });
        chequeForm.reset();
      }
      onDone();
    } catch (error: any) {
      const code = apiErrorCode(error);
      if (code === "CHEQUE_SERIAL_EXISTS") {
        chequeForm.setError("serial", {
          type: "manual",
          message: "Cheque with this serial already exists.",
        });
        return;
      }
      if (code === "PAYEE_NOT_FOUND") {
        chequeForm.setError("payee", {
          type: "manual",
          message: "errors.PAYEE_NOT_FOUND",
        });
        return;
      }
      if (apiValidationIssues(error).some((i) => i.code === "payee_required")) {
        chequeForm.setError("payee", {
          type: "manual",
          message: "validation.payee_required",
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
    <Form {...chequeForm}>
      <form className="space-y-4" onSubmit={chequeForm.handleSubmit(onSubmit)}>
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
                        disabled={isLoading}
                        variant={"outline"}
                        className={cn(
                          "w-[245px] pl-3 text-left font-normal",
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
                      disabled={isLoading}
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
                  <Input
                    {...field}
                    type="string"
                    className="input"
                    disabled={isLoading}
                  />
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
                        disabled={isLoading}
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
                      <CommandInput
                        disabled={isLoading}
                        className="text-md"
                        placeholder={t("Search...")}
                      />
                      <CommandEmpty>{t("No matching results")}</CommandEmpty>
                      <CB_ScrollArea>
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
          control={chequeForm.control}
          name="value"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Value")}</FormLabel>
              <FormControl>
                <div className="relative w-full justify-between">
                  <span className="text-muted-foreground absolute start-3 top-0 bottom-0 my-auto h-6 w-6">
                    <ShekelIcon />
                  </span>
                  <Input
                    {...field}
                    type="string"
                    autoFocus={!cheque && !!defaults?.serial}
                    className="input ps-12 pe-4 text-start"
                    disabled={isLoading}
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
          control={chequeForm.control}
          name="isCancelled"
          render={({ field }) => (
            <FormItem className="flex flex-col" dir="ltr">
              <FormControl>
                <label className="flex items-center">
                  <Switch
                    disabled={isLoading}
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
        <ResponsiveDialogFooter>
          <Button type="submit" disabled={isLoading} className="md:w-[45%]">
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : cheque ? (
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

export default ChequeForm;
