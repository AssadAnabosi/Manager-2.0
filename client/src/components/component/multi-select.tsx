import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, XCircle, ChevronsUpDown, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface MultiSelectFormFieldProps {
  list: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  defaultValue?: string[];
  onValueChange: (value: string[]) => void;
  placeholder: string;
  isLoading: boolean;
}

const MultiSelectFormField = React.forwardRef<
  HTMLButtonElement,
  MultiSelectFormFieldProps
>(
  (
    { list, defaultValue, onValueChange, placeholder, isLoading, ...props },
    ref,
  ) => {
    const { t } = useTranslation();
    const [selectedValues, setSelectedValues] = useState(
      new Set(defaultValue || []),
    );
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => {
      setSelectedValues(new Set(defaultValue));
    }, [defaultValue]);

    const handleInputKeyDown = (event: any) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.target.value) {
        const values = Array.from(selectedValues);
        values.pop();
        setSelectedValues(new Set(values));
        onValueChange(values);
      }
    };

    const toggleOption = useCallback(
      (value: string) => {
        const newSelectedValues = new Set(selectedValues);
        if (newSelectedValues.has(value)) {
          newSelectedValues.delete(value);
        } else {
          newSelectedValues.add(value);
        }
        setSelectedValues(newSelectedValues);
        onValueChange(Array.from(newSelectedValues));
      },
      [selectedValues, onValueChange],
    );

    return isLoading ? (
      <Skeleton className="h-10 w-full  md:w-[33%] md:min-w-[335px]" />
    ) : (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit hover:bg-card md:w-[33%] md:min-w-[335px] print:hidden"
          >
            {Array.from(selectedValues).length > 0 ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center">
                  {Array.from(selectedValues).map((value) => {
                    const option = list.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    return (
                      <Badge
                        key={value}
                        variant="outline"
                        className="m-1 bg-inverse text-inverse-foreground"
                      >
                        {IconComponent && (
                          <IconComponent className="mr-2 h-4 w-4" />
                        )}
                        {option?.label}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            toggleOption(value);
                            event.stopPropagation();
                          }}
                        />
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="mx-2 h-4 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      setSelectedValues(new Set([]));
                      onValueChange(Array.from(new Set([])));
                      event.stopPropagation();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex h-full min-h-6"
                  />
                  <ChevronsUpDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full items-center justify-between">
                <span className="mx-3 text-sm text-muted-foreground">
                  {placeholder}
                </span>
                <ChevronsUpDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="scrolling-auto max-h-[var(--radix-popper-available-height);] w-[200px] min-w-[var(--radix-popper-anchor-width)] overflow-y-auto p-0 drop-shadow-xl md:w-[335px]"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
          onInteractOutside={(event) => {
            if (!event.defaultPrevented) {
              setIsPopoverOpen(false);
            }
          }}
        >
          <Command>
            <CommandInput
              placeholder={t("Search...")}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>{t("No matching results")}</CommandEmpty>
              <CommandGroup>
                {list.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        toggleOption(option.value);
                      }}
                      style={{
                        pointerEvents: "auto",
                        opacity: 1,
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedValues.size > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedValues(new Set([]));
                        onValueChange(Array.from(new Set([])));
                      }}
                      style={{
                        pointerEvents: "auto",
                        opacity: 1,
                      }}
                      className="justify-center text-center"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelectFormField.displayName = "MultiSelectFormField";

export default MultiSelectFormField;
