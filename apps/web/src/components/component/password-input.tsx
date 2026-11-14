import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, disabled = false, onKeyDown, onKeyUp, onBlur, ...props },
    ref
  ) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    return (
      <div>
        <div className="focus-within:group group relative">
          <Input
            type={showPassword && !disabled ? "text" : "password"}
            className={cn("hide-password-toggle pe-10", className)}
            ref={ref}
            onKeyDown={(e) => {
              setCapsLock(e.getModifierState?.("CapsLock") ?? false);
              onKeyDown?.(e);
            }}
            onKeyUp={(e) => {
              setCapsLock(e.getModifierState?.("CapsLock") ?? false);
              onKeyUp?.(e);
            }}
            onBlur={(e) => {
              setCapsLock(false);
              onBlur?.(e);
            }}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "absolute end-0 top-0 h-full px-3 py-2 group-focus-within:block group-hover:block hover:bg-transparent",
              isDesktop ? "hidden" : "block"
            )}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {showPassword ? t("Hide password") : t("Show password")}
            </span>
          </Button>

          {/* hides browsers password toggles */}
          <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
          }
        `}</style>
        </div>
        {capsLock && (
          <p
            role="status"
            className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400"
          >
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            {t("Caps Lock is on")}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
