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
    <Skeleton className="w-full md:w-[335px]  h-10" />
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[335px] justify-between text-muted-foreground font-semibold"
        >
          {filter
            ? list.find((list) => list.value === filter)?.label
            : placeholder}
          <ChevronsUpDown className="ltr:ml-2 rtl:mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[335px] p-0">
        <Command>
          <CommandInput placeholder={t("Search...")} />
          <CommandEmpty>{t("No matching results")}</CommandEmpty>
          <CommandGroup>
            {list.map((item) => (
              <CommandItem
                value={item.label}
                key={item.value}
                onSelect={() => {
                  setFilter(item.value === filter ? "" : item.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "ltr:mr-2 rtl:ml-2 h-4 w-4",
                    filter === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;
