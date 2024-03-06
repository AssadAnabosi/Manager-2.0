import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PayeeType } from "@/lib/types";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  payeeFormSchema,
  payeeFormSchemaType,
  usePayeeFormMutation,
} from "@/api/payees";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/use-toast";

import PayeeForm from "./form";

type ComponentProps = {
  children: ReactNode;
  payee?: PayeeType;
  onClose?: (status: boolean) => void;
};

export default function FormDialogDrawer({
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
        title: t("Error"),
        description:
          t(error?.response?.data?.message) || t("Something went wrong"),
      });
    }
  };
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const title = payee ? t("Edit Payee") : t("New Payee");
  const description = payee
    ? t("Edit the payee details")
    : t("Enter the details for the new payee");
  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <PayeeForm
          isDesktop={isDesktop}
          isLoading={isLoading}
          onSubmit={onSubmit}
          payeeForm={payeeForm}
          payee={payee}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left rtl:text-right pt-6">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <PayeeForm
          className="px-4"
          isDesktop={isDesktop}
          isLoading={isLoading}
          onSubmit={onSubmit}
          payeeForm={payeeForm}
          payee={payee}
        />
      </DrawerContent>
    </Drawer>
  );
}
