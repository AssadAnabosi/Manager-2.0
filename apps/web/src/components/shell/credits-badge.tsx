import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import FooterHoverCard from "@/components/component/footer-hover-card";

/**
 * "Made with a heart by ..." in a frosted pill. The author card opens when the
 * pill is hovered; only the handle is a link.
 */
export function CreditsBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <FooterHoverCard>
      <div
        className={cn(
          "glass-pill text-muted-foreground inline-flex cursor-default items-center gap-1.5 rounded-full px-5 py-2 text-sm print:hidden",
          className
        )}
      >
        <span>{t("Made with")}</span>
        <span aria-hidden className="animate-heartbeat text-destructive">
          ❤
        </span>
        <span>{t("by")}</span>
        <a
          href="https://anabosi.dev"
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
        >
          @assadanabosi
        </a>
      </div>
    </FooterHoverCard>
  );
}
