import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { NavMain } from "@/components/shell/nav-main";
import { NavSecondary } from "@/components/shell/nav-secondary";
import { NavUser } from "@/components/shell/nav-user";
import { Brand } from "@/components/shell/brand";
import { SETTINGS_ITEM } from "@/components/shell/nav-items";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t, i18n } = useTranslation();
  return (
    <Sidebar
      side={i18n.dir() === "rtl" ? "right" : "left"}
      collapsible="offcanvas"
      className="print:hidden"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <Brand label={t("Dashboard")} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSecondary
          className="mt-auto"
          items={[
            {
              title: SETTINGS_ITEM.title,
              url: SETTINGS_ITEM.path,
              icon: SETTINGS_ITEM.icon,
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
