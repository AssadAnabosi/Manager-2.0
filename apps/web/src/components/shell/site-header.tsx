import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navItemFor } from "@/components/shell/nav-items";
import { CommandPalette } from "@/components/shell/command-palette";

export function SiteHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const item = navItemFor(pathname);
  return (
    <header className="flex h-[calc(var(--header-height)+max(env(safe-area-inset-top),0.75rem))] md:h-(--header-height) shrink-0 items-center gap-2 border-b pt-[max(env(safe-area-inset-top),0.75rem)] md:pt-0 transition-[width,height] ease-linear print:hidden">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{item ? t(item.title) : ""}</h1>
        <CommandPalette />
      </div>
    </header>
  );
}
