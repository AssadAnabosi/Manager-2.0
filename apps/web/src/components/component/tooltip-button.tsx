import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = Omit<ComponentProps<typeof Button>, "aria-label"> & {
  /** The accessible name and the tooltip text. */
  label: string;
};

/**
 * An icon button with a tooltip. The tooltip wraps the button (not the icon inside it), so
 * hovering or focusing the button shows it, and the button can still be a dialog trigger.
 */
export default function TooltipButton({ label, children, ...props }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label={label} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
