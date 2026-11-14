import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/providers/auth-context";
import { navGroupsFor, navItemFor } from "./nav-items";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const groups = navGroupsFor(useAuth().user?.role);
  const current = navItemFor(pathname);

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={current?.path === item.path}
                  tooltip={t(item.title)}
                >
                  <Link
                    to={item.path}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <item.icon />
                    <span>{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
