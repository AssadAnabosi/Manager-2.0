import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LogType } from "@/lib/types";
import { getToday, toList } from "@/lib/utils";
// import { useMediaQuery } from "@/hooks/use-media-query";

import {
  logFormSchema,
  logFormSchemaType,
  useLogFormMutation,
} from "@/api/logs";
import { useGetUsersQuery } from "@/api/users";

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

import LogForm from "./form";

type ComponentProps = {
  children: ReactNode;
  log?: LogType;
  onClose?: (status: boolean) => void;
};

export default function FormDialogDrawer({
  children,
  log,
  onClose,
}: ComponentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const logForm = useForm<logFormSchemaType>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      date: log ? new Date(log?.date) : getToday(),
      worker: log?.worker?.id || undefined,
      startingTime: log?.startingTime || "08:30",
      finishingTime: log?.finishingTime || "16:30",
      isAbsent: log?.isAbsent || false,
      payment: log?.payment.toString() || "0",
      remarks: log?.remarks || "",
    },
  });
  const isLoading = logForm.formState.isSubmitting;

  const { data: usersData, isLoading: filterLoading } = useGetUsersQuery();
  const workers = toList(usersData?.users || [], "fullName", true);

  const { mutateAsync } = useLogFormMutation();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [calendarOpen, setCalenderOpen] = useState(false);

  const onSubmit = async (data: logFormSchemaType) => {
    try {
      if (log) {
        await mutateAsync({ data, logId: log.id });
      } else {
        await mutateAsync({ data });
        logForm.reset();
      }
      setOpen(false);
      onClose?.(false);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      if (message)
        switch (message) {
          case "There is a record of this log already":
            logForm.setError("date", {
              type: "manual",
              message: "This log already exists",
            });
            return;
        }
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    }
  };
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const isDesktop = true;
  const title = log ? t("Edit Log") : t("New Log");
  const description = log
    ? t("Edit the log details")
    : t("Enter the details for the new log");
  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LogForm
          isDesktop={isDesktop}
          isLoading={isLoading}
          calendarOpen={calendarOpen}
          setCalenderOpen={setCalenderOpen}
          onSubmit={onSubmit}
          logForm={logForm}
          log={log}
          filterLoading={filterLoading}
          workers={workers}
          popoverOpen={popoverOpen}
          setPopoverOpen={setPopoverOpen}
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
        <LogForm
          className="px-4"
          isDesktop={isDesktop}
          isLoading={isLoading}
          calendarOpen={calendarOpen}
          setCalenderOpen={setCalenderOpen}
          onSubmit={onSubmit}
          logForm={logForm}
          log={log}
          filterLoading={filterLoading}
          workers={workers}
          popoverOpen={popoverOpen}
          setPopoverOpen={setPopoverOpen}
        />
      </DrawerContent>
    </Drawer>
  );
}
