import type { ReactNode } from "react";
import { toast as sonner } from "sonner";

type ToastOptions = {
  variant?: "default" | "success" | "destructive" | "inverse" | "primary";
  title?: ReactNode;
  description?: ReactNode;
  /** Milliseconds; leave out for the default. */
  duration?: number;
};

/**
 * `toast({ variant, title, description })`, shown by Sonner. The `Toaster` is mounted once in
 * `main.tsx`.
 */
function toast({
  variant = "default",
  title,
  description,
  duration,
}: ToastOptions) {
  const message = title ?? description;
  const options = { description: title ? description : undefined, duration };
  if (variant === "success") return sonner.success(message, options);
  if (variant === "destructive") return sonner.error(message, options);
  return sonner(message, options);
}

function useToast() {
  return { toast };
}

export { useToast, toast };
