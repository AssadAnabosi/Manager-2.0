import type { ReactNode } from "react";

import { useAltHeld } from "@/hooks/use-alt-held";

/** While Alt (Option on a Mac) is held, the letter that triggers the thing this sits in. */
export function ShortcutKey({ children }: { children: ReactNode }) {
  const altHeld = useAltHeld();
  if (!altHeld) return null;
  return (
    <kbd
      dir="ltr"
      aria-hidden="true"
      className="border-current/40 bg-current/15 ms-1 min-w-5 rounded border px-1 text-center font-mono text-xs font-medium"
    >
      {children}
    </kbd>
  );
}
