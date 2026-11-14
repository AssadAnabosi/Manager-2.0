import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/providers/auth-context";
import { navGroupsFor, navItemFor } from "@/components/shell/nav-items";
import {
  SidebarGroup,
  SidebarGroupContent,
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
          <SidebarGroupLabel className="text-sm md:text-xs">
            {t(group.label)}
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu className="gap-1.5 md:gap-1">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className="h-12 text-base md:h-8 md:text-sm [&>svg]:size-5 md:[&>svg]:size-4"
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
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
