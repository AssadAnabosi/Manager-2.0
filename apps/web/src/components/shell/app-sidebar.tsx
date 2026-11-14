import { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Brand } from "./brand";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { t, i18n } = useTranslation();
  return (
    <Sidebar
      side={i18n.dir() === "rtl" ? "right" : "left"}
      collapsible="icon"
      className="print:hidden"
      {...props}
    >
      <SidebarHeader className="h-[var(--header-height)] justify-center border-b border-sidebar-border">
        <Brand label={t("Dashboard")} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
