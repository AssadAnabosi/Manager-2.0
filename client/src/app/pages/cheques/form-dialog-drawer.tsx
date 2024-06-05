import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChequeType } from "@/lib/types";
import { toList, getLastDayOfCurrentMonthDate } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  chequeFormSchema,
  chequeFormSchemaType,
  useChequeFormMutation,
} from "@/api/cheques";
import { useGetPayeesQuery } from "@/api/payees";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

import ChequeForm from "./form";

type ComponentProps = {
  children: ReactNode;
  cheque?: ChequeType;
  onClose?: (status: boolean) => void;
};

export default function FormDialogDrawer({
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
      serial: cheque?.serial.toString() || "",
      value: cheque?.value.toString() || "",
      isCancelled: cheque?.isCancelled || false,
      remarks: cheque?.remarks || "",
    },
  });
  const isLoading = chequeForm.formState.isSubmitting;

  const { data: payeesData, isLoading: filterLoading } = useGetPayeesQuery();
  const payees = toList(payeesData?.payees || [], "name");

  const { mutateAsync } = useChequeFormMutation();
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      onClose?.(false);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      if (message)
        switch (message) {
          case "Serial already exists":
            chequeForm.setError("serial", {
              type: "manual",
              message: "Cheque with this serial already exists.",
            });
            return;
          case "Payee not found":
            chequeForm.setError("payee", {
              type: "manual",
              message: "Payee not found",
            });
            return;
          case "Please select a payee":
            chequeForm.setError("payee", {
              type: "manual",
              message: "Please select a payee",
            });
            return;
        }
      toast({
        variant: "destructive",
        title: t("Error"),
        description:
          t(error?.response?.data?.message) || t("Something went wrong"),
      });
    }
  };

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const title = cheque
    ? t(`Edit Cheque #{{serial}}`, {
        serial: cheque.serial,
      })
    : t("New Cheque");
  const description = cheque
    ? t("Edit the cheque details")
    : t("Enter the details for the new cheque");
  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pt-6 text-left rtl:text-right">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ChequeForm
          isDesktop={isDesktop}
          isLoading={isLoading}
          calendarOpen={calendarOpen}
          setCalenderOpen={setCalenderOpen}
          onSubmit={onSubmit}
          chequeForm={chequeForm}
          cheque={cheque}
          filterLoading={filterLoading}
          payees={payees}
          popoverOpen={popoverOpen}
          setPopoverOpen={setPopoverOpen}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pt-6 text-left rtl:text-right">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto">
          <ChequeForm
            className="px-4"
            isDesktop={isDesktop}
            isLoading={isLoading}
            calendarOpen={calendarOpen}
            setCalenderOpen={setCalenderOpen}
            onSubmit={onSubmit}
            chequeForm={chequeForm}
            cheque={cheque}
            filterLoading={filterLoading}
            payees={payees}
            popoverOpen={popoverOpen}
            setPopoverOpen={setPopoverOpen}
          />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
