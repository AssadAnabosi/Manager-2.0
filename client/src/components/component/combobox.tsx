import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea as CB_ScrollArea } from "@/components/component/cb-scroll-area";

import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";
import { ListType } from "@/lib/types";

type ComboboxProps = {
  list: ListType[];
  filter: string;
  setFilter: (filter: string) => void;
  placeholder?: string;
  isLoading: boolean;
};

const Combobox = ({
  list = [],
  filter,
  setFilter,
  placeholder = "Select...",
  isLoading = false,
}: ComboboxProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return isLoading ? (
    <Skeleton className="h-10 w-full  md:w-[335px]" />
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-semibold text-muted-foreground md:w-[335px] print:hidden"
        >
          {filter
            ? list.find((list) => list.value === filter)?.label
            : placeholder}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ltr:ml-2 rtl:mr-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] p-0 md:w-[335px]">
        <Command>
          <CommandInput className="text-md" placeholder={t("Search...")} />
          <CommandEmpty>{t("No matching results")}</CommandEmpty>
          <CB_ScrollArea className="h-72">
            <CommandGroup>
              <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
              {list.map((item) => (
                <CommandItem
                  value={item.label}
                  key={item.value}
                  onSelect={() => {
                    setFilter(item.value === filter ? "" : item.value);
                    setOpen(false);
                  }}
                  className="min-w-[var(--radix-popper-anchor-width)]"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 ltr:mr-2 rtl:ml-2",
                      filter === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CB_ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;
