import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import { ChequeType } from "@/lib/types";

import {
  chequeFormSchema,
  chequeFormSchemaType,
  useChequeFormMutation,
} from "@/api/cheques";
import { useGetPayeesListQuery } from "@/api/payees";

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

import {
  cn,
  stringToDate,
  dateToString,
  toList,
  getLastDayOfCurrentMonthDate,
} from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type ComponentProps = {
  children: ReactNode;
  cheque?: ChequeType;
  onClose?: (status: boolean) => void;
};

export default function FormDialog({
  children,
  cheque,
  onClose,
}: ComponentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const chequeForm = useForm<chequeFormSchemaType>({
    resolver: zodResolver(chequeFormSchema),
    defaultValues: {
      dueDate: cheque
        ? new Date(cheque?.dueDate)
        : getLastDayOfCurrentMonthDate(),
      payee: cheque?.payee?.id || undefined,
      serial: cheque?.serial.toString() || undefined,
      value: cheque?.value.toString() || "",
      isCancelled: cheque?.isCancelled || false,
      remarks: cheque?.remarks || "",
    },
  });
  const isLoading = chequeForm.formState.isSubmitting;

  const { data: payeesData, isLoading: filterLoading } =
    useGetPayeesListQuery();
  const payees = toList(payeesData?.payees || [], "name");

  const { mutateAsync } = useChequeFormMutation();
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: chequeFormSchemaType) => {
    try {
      data = { ...data, dueDate: dateToString(data.dueDate) };
      if (cheque) {
        await mutateAsync({ data, chequeId: cheque.id });
      } else {
        await mutateAsync({ data });
        chequeForm.reset();
      }
      setOpen(false);
      onClose?.(false);
    } catch (error: any) {
      console.log(error);
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
          <DialogTitle>
            {cheque ? t(`Edit Cheque #${cheque.serial}`) : t("New Cheque")}
          </DialogTitle>
          <DialogDescription>
            {cheque
              ? t("Edit the cheque details")
              : t("Enter the details for the new cheque")}
          </DialogDescription>
        </DialogHeader>
        <Form {...chequeForm}>
          <form
            onSubmit={chequeForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="flex gap-5">
              <FormField
                control={chequeForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Date")}</FormLabel>
                    <Popover>
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
                              format(
                                stringToDate(field.value),
                                "EEE, dd/LL/y",
                                {
                                  locale:
                                    document.documentElement.lang === "ar"
                                      ? ar
                                      : enGB,
                                }
                              )
                            ) : (
                              <span>{t("Pick a date")}</span>
                            )}
                            <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
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
              <FormField
                control={chequeForm.control}
                name="serial"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Serial No.")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="string" className="input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={chequeForm.control}
              name="payee"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Worker")}</FormLabel>
                  {!filterLoading ? (
                    <Popover>
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
                              ? payees.find(
                                  (payee) => payee.value === field.value
                                )?.label
                              : "Select payee"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Search payee..." />
                          <CommandEmpty>
                            {t("No matching results")}
                          </CommandEmpty>
                          <CommandGroup>
                            {payees.map((payee) => (
                              <CommandItem
                                className={
                                  !payee.active
                                    ? "opacity-50 text-muted-foregroundF"
                                    : ""
                                }
                                disabled={!payee.active}
                                value={payee.label}
                                key={payee.value}
                                onSelect={() => {
                                  if (payee.active) {
                                    chequeForm.getValues("payee") ===
                                    payee.value
                                      ? chequeForm.setValue("payee", "")
                                      : chequeForm.setValue(
                                          "payee",
                                          payee.value
                                        );
                                  }
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
              control={chequeForm.control}
              name="value"
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
                <FormItem className="flex flex-col">
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="md:w-[45%]">
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : cheque ? (
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
