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
    <div className="relative w-full justify-between print:hidden">
      <MagnifyingGlassIcon className="text-muted-foreground absolute start-3 top-0 bottom-0 my-auto h-6 w-6" />
      <Input
        type="text"
        placeholder={t(placeholder)}
        className="ps-12 pe-4"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Searchbox;
