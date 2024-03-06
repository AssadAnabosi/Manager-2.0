import { useTranslation } from "react-i18next";
import { PayeeType } from "@/lib/types";
import { cn } from "@/lib/utils";

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
import { DialogFooter } from "@/components/ui/dialog";
import { DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import Spinner from "@/components/component/spinner";

const PayeeForm = ({
  className,
  isDesktop,
  payeeForm,
  onSubmit,
  isLoading,
  payee,
}: {
  className?: string;
  isDesktop: boolean;
  payeeForm: any;
  onSubmit: any;
  isLoading: boolean;
  payee?: PayeeType;
}) => {
  const { t } = useTranslation();
  const footerContent = (
    <Button type="submit" disabled={isLoading} className="md:w-[45%]">
      {isLoading ? (
        <Spinner className="h-4 w-4" />
      ) : payee ? (
        t("Save Changes")
      ) : (
        t("Create")
      )}
    </Button>
  );
  return (
    <Form {...payeeForm}>
      <form
        className={cn(className, "space-y-4")}
        onSubmit={payeeForm.handleSubmit(onSubmit)}
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
        {isDesktop ? (
          <DialogFooter>{footerContent}</DialogFooter>
        ) : (
          <DrawerFooter className="pt-2">{footerContent}</DrawerFooter>
        )}
      </form>
    </Form>
  );
};

export default PayeeForm;
