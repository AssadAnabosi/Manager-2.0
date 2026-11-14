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
    <header className="flex h-[calc(3.5rem+max(env(safe-area-inset-top),0.75rem))] shrink-0 items-center gap-2 border-b pt-[max(env(safe-area-inset-top),0.75rem)] transition-[width,height] ease-linear md:h-(--header-height) md:pt-0 print:hidden">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1 size-9 md:size-7 [&_svg]:size-5 md:[&_svg]:size-4" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-5 md:data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-medium md:text-base">
          {item ? t(item.title) : ""}
        </h1>
        <CommandPalette />
      </div>
    </header>
  );
}
