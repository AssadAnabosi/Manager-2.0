import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { XCircle, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  /** The serials as the URL holds them: "101,205". */
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
};

/** Western digits only: ٣٤٥ and the like are not accepted. */
const DIGITS = /^[0-9]+$/;
const MAX_LENGTH = 9;

const parse = (value: string) => (value ? value.split(",") : []);

/**
 * Serial numbers as chips: type a number and press Enter (or comma, or space) to add it,
 * Backspace on an empty box takes the last one back. Only the digits 0-9 are accepted.
 */
const SerialChips = ({
  value,
  setValue,
  placeholder = "Serial No.",
}: Props) => {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);
  const serials = parse(value);

  const commit = (next: string[]) => setValue(next.join(","));

  /** Add every number in `text`; anything else flags the box and is left out. */
  const add = (text: string) => {
    const tokens = text.split(/[\s,]+/).filter(Boolean);
    const good = tokens.filter((token) => DIGITS.test(token));
    const bad = tokens.filter((token) => !DIGITS.test(token));
    const next = [...serials];
    for (const token of good) {
      // every digit counts: 007 is not 7
      const serial = token.slice(0, MAX_LENGTH);
      if (!next.includes(serial)) next.push(serial);
    }
    if (next.length !== serials.length) commit(next);
    setInvalid(bad.length > 0);
    setDraft(bad.join(" "));
  };

  const onChange = (text: string) => {
    // keystrokes that are not 0-9 never get in; say why instead of silently eating them
    const clean = text.replace(/[^0-9,\s]/g, "");
    setInvalid(clean !== text);
    // a comma or a space ends a number
    if (/[,\s]/.test(clean)) add(clean);
    else setDraft(clean.slice(0, MAX_LENGTH));
  };

  return (
    <div className="w-full print:hidden">
      <div
        className={cn(
          "border-input dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 relative flex min-h-11 w-full cursor-text flex-wrap items-center gap-1 rounded-md border bg-transparent py-1 ps-12 pe-9 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] md:min-h-9",
          invalid &&
            "border-destructive focus-within:border-destructive focus-within:ring-destructive/20"
        )}
        onClick={() => input.current?.focus()}
      >
        <MagnifyingGlassIcon className="text-muted-foreground absolute start-3 top-0 bottom-0 my-auto h-6 w-6" />
        {serials.map((serial) => (
          <Badge
            key={serial}
            variant="outline"
            className="bg-inverse text-inverse-foreground h-6 gap-1 ps-2.5 pe-1"
          >
            <bdi dir="ltr">{serial}</bdi>
            <button
              type="button"
              aria-label={t("Remove serial {{serial}}", { serial })}
              className="grid place-items-center rounded-full outline-none focus-visible:ring-2"
              onClick={(e) => {
                e.stopPropagation();
                commit(serials.filter((s) => s !== serial));
              }}
            >
              <XCircle className="size-4" />
            </button>
          </Badge>
        ))}
        <input
          ref={input}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={invalid}
          aria-label={t(placeholder)}
          placeholder={serials.length ? "" : t(placeholder)}
          value={draft}
          className="placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent px-1 text-base outline-none md:text-sm rtl:text-right"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft) add(draft);
            } else if (e.key === "Backspace" && !draft && serials.length) {
              commit(serials.slice(0, -1));
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/[,\s]/.test(text.trim())) {
              e.preventDefault();
              add(`${draft} ${text}`);
            }
          }}
          onBlur={() => setInvalid(false)}
        />
        {(serials.length > 0 || draft) && (
          <button
            type="button"
            aria-label={t("Clear")}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute end-2 top-0 bottom-0 my-auto grid size-7 place-items-center rounded-full outline-none focus-visible:ring-[3px]"
            onClick={(e) => {
              e.stopPropagation();
              commit([]);
              setDraft("");
              setInvalid(false);
              input.current?.focus();
            }}
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
      {invalid && (
        <p role="alert" className="text-destructive mt-1 text-xs">
          {t("Serial numbers use the digits 0-9 only")}
        </p>
      )}
    </div>
  );
};

export default SerialChips;
