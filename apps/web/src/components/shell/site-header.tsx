import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navItemFor } from "./nav-items";

export function SiteHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const item = navItemFor(pathname);
  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur print:hidden">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <span className="truncate text-sm font-medium">
        {item ? t(item.title) : ""}
      </span>
    </header>
  );
}
