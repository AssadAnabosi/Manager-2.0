import type { ReactNode } from "react";
import { Direction } from "radix-ui";

import { useLocale } from "@/hooks/use-locale";

/**
 * Radix components default to left-to-right and set `dir="ltr"` on themselves, which overrides
 * the page's direction (tabs, for one, came out in the wrong order in Arabic). This tells all of
 * them the active language's direction.
 */
export function RadixDirection({ children }: { children: ReactNode }) {
  const { dir } = useLocale();
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}
