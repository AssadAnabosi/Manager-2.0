import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PayeeType } from "@/lib/types";

import {
  payeeFormSchema,
  payeeFormSchemaType,
  usePayeeFormMutation,
} from "@/api/payees";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Spinner from "@/components/component/spinner";
import { useToast } from "@/components/ui/use-toast";

type ComponentProps = {
  children: ReactNode;
  payee?: PayeeType;
  onClose?: (status: boolean) => void;
};

export default function FormDialog({
  children,
  payee,
  onClose,
}: ComponentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const payeeForm = useForm<payeeFormSchemaType>({
    resolver: zodResolver(payeeFormSchema),
    defaultValues: {
      name: payee?.name || "",
      email: payee?.email || "",
      phoneNumber: payee?.phoneNumber || "",
      remarks: payee?.remarks || "",
    },
  });
  const isLoading = payeeForm.formState.isSubmitting;

  const { mutateAsync } = usePayeeFormMutation();
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: payeeFormSchemaType) => {
    try {
      if (payee) {
        await mutateAsync({ data, payeeId: payee.id });
      } else {
        await mutateAsync({ data });
        payeeForm.reset();
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
          <DialogTitle>{payee ? t("Edit Payee") : t("New Payee")}</DialogTitle>
          <DialogDescription>
            {payee
              ? t("Edit the payee details")
              : t("Enter the details for the new payee")}
          </DialogDescription>
        </DialogHeader>
        <Form {...payeeForm}>
          <form
            onSubmit={payeeForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={payeeForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Name")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="string" className="input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={payeeForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Email")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="string" className="input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={payeeForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Phone Number")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="string" className="input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={payeeForm.control}
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="md:w-[45%]">
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : payee ? (
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
