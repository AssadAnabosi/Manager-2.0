import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { enGB, ar } from "date-fns/locale";
import useAxios from "@/hooks/use-axios";
import { BillType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, stringToDate, dateToString } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  // FormDescription,
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
import Spinner from "@/components/component/spinner";

import { CalendarIcon } from "lucide-react";
import ShekelIcon from "@/components/icons/shekel";

import { getToday } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type ComponentProps = {
  children: ReactNode;
  bill?: BillType;
  onClose?: (status: boolean) => void;
};

const billFormSchema = z.object({
  date: z.any({
    required_error: "Date is required",
  }),
  value: z.string(),
  // .refine(
  //   (value) => {
  //     const number = Number(value);
  //     return !isNaN(number) && value?.length > 0;
  //   },
  //   { message: "Invalid number" }
  // ),
  description: z.string().min(1, "Description is required"),
  remarks: z.string().optional(),
});

type billFormSchemaType = z.infer<typeof billFormSchema>;

export default function FormDialog({
  children,
  bill,
  onClose,
}: ComponentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const billForm = useForm<billFormSchemaType>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      date: bill ? new Date(bill?.date) : getToday(),
      value: bill?.value.toString() || "",
      description: bill?.description || "",
      remarks: bill?.remarks || "",
    },
  });
  const isLoading = billForm.formState.isSubmitting;
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (data: billFormSchemaType) => {
      if (!bill) {
        return axios.post("/bills", data);
      } else {
        return axios.put(`/bills/${bill.id}`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bills"],
      });
      toast({
        variant: "success",
        title: "Success",
        description: "Bill was added successfully",
      });
    },
  });

  const axios = useAxios();
  const onSubmit = async (data: billFormSchemaType) => {
    try {
      data = { ...data, date: dateToString(data.date) };
      await mutateAsync(data);
      if (!bill) {
        billForm.reset();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    }
  };
  return (
    <Dialog onOpenChange={onClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{bill ? t("Edit Bill") : t("New Bill")}</DialogTitle>
          <DialogDescription>
            {bill
              ? t("Edit the bill details")
              : t("Enter the details for the new bill")}
          </DialogDescription>
        </DialogHeader>
        <Form {...billForm}>
          <form
            onSubmit={billForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={billForm.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Date")}</FormLabel>
                  <Popover>
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
              control={billForm.control}
              name="value"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Value")}</FormLabel>
                  <FormControl>
                    <div className="relative w-full justify-between">
                      <span className="absolute top-0 bottom-0 w-6 h-6 my-auto text-muted-foreground ltr:left-3 rtl:right-3">
                        <ShekelIcon />
                      </span>
                      <Input
                        {...field}
                        type="string"
                        className="input ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4"
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
                    <Input {...field} type="string" className="input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="md:w-[45%]">
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : bill ? (
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
