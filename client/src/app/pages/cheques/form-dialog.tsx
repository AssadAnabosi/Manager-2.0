import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChequeType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ComponentProps = {
  children: ReactNode;
  cheque: ChequeType;
  onClose?: (status: boolean) => void;
};

export default function FormDialog({
  children,
  cheque,
  onClose,
}: ComponentProps) {
  const { t } = useTranslation();
  return (
    <Dialog onOpenChange={onClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left rtl:text-right pt-6">
          <DialogTitle>
            {cheque ? t("Edit Cheque") : t("New Cheque")}
          </DialogTitle>
          <DialogDescription>
            {cheque
              ? t("Edit the worksheet for {{no}}", {
                  num: cheque.serial,
                })
              : t("Enter the details for the new cheque")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              type="date"
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">
            {cheque ? t("Save Changes") : t("Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
