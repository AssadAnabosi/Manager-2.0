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

type ComboboxProps = {
  list: { label: string; value: string }[];
  search: string;
  setSearch: (search: string) => void;
  placeholder?: string;
  isLoading: boolean;
};

const Combobox = ({
  list,
  search,
  setSearch,
  placeholder = "Select...",
  isLoading = false,
}: ComboboxProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return isLoading ? (
    <Skeleton className="w-full md:w-[335px]" />
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[335px] justify-between text-muted-foreground font-semibold"
        >
          {search
            ? list.find((framework) => framework.value === search)?.label
            : placeholder}
          <ChevronsUpDown className="ltr:ml-2 rtl:mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="md:w-[335px] p-0">
        <Command>
          <CommandInput placeholder={t("Search...")} />
          <CommandEmpty>{t("No matching results")}</CommandEmpty>
          <CommandGroup>
            {list.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  setSearch(currentValue === search ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "ltr:mr-2 rtl:ml-2 h-4 w-4",
                    search === item.value ? "opacity-100" : "opacity-0"
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
