import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, CircleUser, EllipsisVertical, LogOut } from "lucide-react";

import { useAuth } from "@/providers/auth-context";
import { ThemeType, useTheme } from "@/providers/theme-provider";
import RoleBadge from "@/app/pages/users/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const THEMES: { value: ThemeType; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export function NavUser() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useSidebar();
  const lang = (i18n.resolvedLanguage ?? "en").substring(0, 2);

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback className="rounded-lg">
                  <CircleUser className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  <bdi dir="ltr">@{user.username}</bdi>
                </span>
              </div>
              <EllipsisVertical className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : i18n.dir() === "rtl" ? "left" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="flex items-center justify-between gap-2 font-normal">
              <span className="truncate">{user.fullName}</span>
              <RoleBadge role={user.role} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {t("Theme")}
              </DropdownMenuLabel>
              {THEMES.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onSelect={(e) => {
                    e.preventDefault();
                    setTheme(item.value);
                  }}
                >
                  <span className="flex-1">{t(item.label)}</span>
                  {theme === item.value && <Check />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {t("Language")}
              </DropdownMenuLabel>
              {LANGUAGES.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onSelect={(e) => {
                    e.preventDefault();
                    i18n.changeLanguage(item.value);
                  }}
                >
                  <span className="flex-1">{item.label}</span>
                  {lang === item.value && <Check />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/logout">
                <LogOut />
                {t("Logout")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
