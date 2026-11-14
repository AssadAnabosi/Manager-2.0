import { useState } from "react";
import { apiErrorText } from "@/lib/api-error";
import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks/use-locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BillType } from "@/lib/types";

import { cn, getToday, stringToDate } from "@/lib/utils";
import {
  billFormSchema,
  billFormSchemaType,
  useBillFormMutation,
} from "@/api/bills";

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
import { ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/component/spinner";

import { CalendarIcon } from "lucide-react";
import ShekelIcon from "@/components/icons/shekel";
import TypeToggle from "./type-toggle";

/** Keeps only digits and one decimal point, so only positive numbers can be typed. */
const positiveNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : whole;
};

type BillFormProps = {
  bill?: BillType;
  /** Called after a successful save. */
  onDone: () => void;
};

const BillForm = ({ bill, onDone }: BillFormProps) => {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { toast } = useToast();
  const [calendarOpen, setCalenderOpen] = useState(false);
  const billForm = useForm<billFormSchemaType>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      date: bill ? new Date(bill.date) : getToday(),
      type: bill?.type || "expense",
      amount: bill?.amount?.toString() || "",
      description: bill?.description || "",
      remarks: bill?.remarks || "",
    },
  });
  const isLoading = billForm.formState.isSubmitting;
  const { mutateAsync } = useBillFormMutation();

  const onSubmit = async (data: billFormSchemaType) => {
    try {
      if (bill) {
        await mutateAsync({ data, billId: bill.id });
      } else {
        await mutateAsync({ data });
        billForm.reset();
      }
      onDone();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error"),
        description:
          apiErrorText(error, t),
      });
    }
  };

  return (
    <Form {...billForm}>
      <form className="space-y-4" onSubmit={billForm.handleSubmit(onSubmit)}>
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
                      disabled={isLoading}
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
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
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Type")}</FormLabel>
              <FormControl>
                <TypeToggle
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={billForm.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Amount")}</FormLabel>
              <FormControl>
                <div className="relative w-full justify-between">
                  <span className="text-muted-foreground absolute start-3 top-0 bottom-0 my-auto h-6 w-6">
                    <ShekelIcon />
                  </span>
                  <Input
                    {...field}
                    type="text"
                    inputMode="decimal"
                    autoFocus={!bill}
                    className="input pe-4 ps-12 text-start"
                    disabled={isLoading}
                    onChange={(e) =>
                      field.onChange(positiveNumber(e.target.value))
                    }
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
                <Input
                  {...field}
                  type="string"
                  className="input"
                  disabled={isLoading}
                />
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
        <ResponsiveDialogFooter>
          <Button type="submit" disabled={isLoading} className="md:w-[45%]">
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : bill ? (
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

export default BillForm;
