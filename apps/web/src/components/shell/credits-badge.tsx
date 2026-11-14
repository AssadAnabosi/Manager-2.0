import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import FooterHoverCard from "@/components/component/footer-hover-card";

/** "Made with love by ..." in a frosted pill that lifts when hovered. */
export function CreditsBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "glass-pill text-muted-foreground inline-flex cursor-default items-center gap-1 rounded-full px-5 py-1 text-sm",
        className
      )}
    >
      <span>{t("Made with ❤️ by")}</span>
      <FooterHoverCard />
    </div>
  );
}
