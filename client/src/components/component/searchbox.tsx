import React from "react";
import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

type ComponentProps = {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
};

const Searchbox = ({
  value,
  setValue,
  placeholder = "Search",
}: ComponentProps) => {
  const { t } = useTranslation();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="relative w-full justify-between">
      <MagnifyingGlassIcon className="absolute top-0 bottom-0 w-6 h-6 my-auto text-muted-foreground ltr:left-3 rtl:right-3" />
      <Input
        type="text"
        placeholder={t(placeholder)}
        className="ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Searchbox;
