import { useCallback, useEffect, useRef, useState } from "react";

import { useIsDesktop } from "@/hooks/use-breakpoint";

/**
 * A details dialog's Edit button: close the details, then open the form from outside it. On
 * a phone both are drawers, and opening one while the other is still sliding away (or from
 * inside it) leaves the new one stuck, so it waits for the first to leave.
 */
export function useEditFromDetails(closeDetails: () => void) {
  const isDesktop = useIsDesktop();
  const [editing, setEditing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const startEditing = useCallback(() => {
    closeDetails();
    clearTimeout(timer.current);
    if (isDesktop) setEditing(true);
    else timer.current = setTimeout(() => setEditing(true), 400);
  }, [closeDetails, isDesktop]);
  return { editing, setEditing, startEditing };
}
