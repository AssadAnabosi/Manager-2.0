import { forwardRef, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
      <div className="focus-within:group group relative">
        <Input
          type={showPassword && !disabled ? "text" : "password"}
          className={cn("hide-password-toggle ltr:pr-10 rtl:pl-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-0 h-full px-3 py-2 hover:bg-transparent group-focus-within:block group-hover:block ltr:right-0 rtl:left-0",
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
            {showPassword ? "Hide password" : "Show password"}
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
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
