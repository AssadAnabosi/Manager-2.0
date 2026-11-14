import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PayeeType } from "@/lib/types";
import {
  payeeFormSchema,
  payeeFormSchemaType,
  usePayeeFormMutation,
} from "@/api/payees";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

import Spinner from "@/components/component/spinner";

type PayeeFormProps = {
  payee?: PayeeType;
  /** Called after a successful save. */
  onDone: () => void;
};

const PayeeForm = ({ payee, onDone }: PayeeFormProps) => {
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

  const onSubmit = async (data: payeeFormSchemaType) => {
    try {
      if (payee) {
        await mutateAsync({ data, payeeId: payee.id });
      } else {
        await mutateAsync({ data });
        payeeForm.reset();
      }
      onDone();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error"),
        description:
          t(error?.response?.data?.message) || t("Something went wrong"),
      });
    }
  };

  return (
    <Form {...payeeForm}>
      <form
        className="space-y-4"
        onSubmit={payeeForm.handleSubmit(onSubmit)}
      >
        <FormField
          control={payeeForm.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Name")}</FormLabel>
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
          control={payeeForm.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Email")}</FormLabel>
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
          control={payeeForm.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Phone Number")}</FormLabel>
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
          control={payeeForm.control}
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
            ) : payee ? (
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

export default PayeeForm;
