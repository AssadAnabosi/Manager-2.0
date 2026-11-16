import React from "react";
import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { XIcon } from "lucide-react";
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
  const input = React.useRef<HTMLInputElement>(null);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="relative w-full justify-between print:hidden">
      <MagnifyingGlassIcon className="text-muted-foreground absolute start-3 top-0 bottom-0 my-auto h-6 w-6" />
      <Input
        ref={input}
        type="text"
        placeholder={t(placeholder)}
        className="ps-12 pe-10"
        value={value}
        onChange={onChange}
      />
      {value && (
        <button
          type="button"
          aria-label={t("Clear")}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute end-2 top-0 bottom-0 my-auto grid size-7 place-items-center rounded-full outline-none focus-visible:ring-[3px]"
          onClick={() => {
            setValue("");
            input.current?.focus();
          }}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
};

export default Searchbox;
