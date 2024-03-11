import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BillType } from "@/lib/types";
import { getToday } from "@/lib/utils";
// import { useMediaQuery } from "@/hooks/use-media-query";

import {
  billFormSchema,
  billFormSchemaType,
  useBillFormMutation,
} from "@/api/bills";

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

import BillForm from "./form";

type ComponentProps = {
  children: ReactNode;
  bill?: BillType;
  onClose?: (status: boolean) => void;
};

export default function FormDialogDrawer({
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

  const { mutateAsync } = useBillFormMutation();
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalenderOpen] = useState(false);

  const onSubmit = async (data: billFormSchemaType) => {
    try {
      if (bill) {
        await mutateAsync({ data, billId: bill.id });
      } else {
        await mutateAsync({ data });
        billForm.reset();
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
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const isDesktop = true;
  const title = bill ? t("Edit Bill") : t("New Bill");
  const description = bill
    ? t("Edit the bill details")
    : t("Enter the details for the new bill");
  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <BillForm
          isDesktop={isDesktop}
          isLoading={isLoading}
          calendarOpen={calendarOpen}
          setCalenderOpen={setCalenderOpen}
          onSubmit={onSubmit}
          billForm={billForm}
          bill={bill}
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
        <BillForm
          className="px-4"
          isDesktop={isDesktop}
          isLoading={isLoading}
          calendarOpen={calendarOpen}
          setCalenderOpen={setCalenderOpen}
          onSubmit={onSubmit}
          billForm={billForm}
          bill={bill}
        />
      </DrawerContent>
    </Drawer>
  );
}
