import React from "react";
import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
type ComponentProps = {
  value: string;
  setValue: (value: string) => void;
};

const Searchbox = ({ value, setValue }: ComponentProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="relative w-[100%] lg:w-[335px] justify-between">
      <MagnifyingGlassIcon className="absolute top-0 bottom-0 w-6 h-6 my-auto text-muted-foreground left-3" />
      <Input
        type="text"
        placeholder="Search"
        className="pl-12 pr-4"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Searchbox;
