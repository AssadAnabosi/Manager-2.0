import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronsUpDown,
  CircleUser,
  LogOut,
  Settings,
} from "lucide-react";

import { useAuth } from "@/providers/auth-context";
import { ThemeType, useTheme } from "@/providers/theme-provider";
import RoleBadge from "@/app/pages/users/role-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const dir = i18n.dir();
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
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <CircleUser className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.fullName}</span>
                <span
                  dir="ltr"
                  className="truncate text-start text-xs text-muted-foreground"
                >
                  @{user.username}
                </span>
              </div>
              <ChevronsUpDown className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : dir === "rtl" ? "left" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="flex items-center justify-between gap-2 font-normal">
              <span className="truncate">{user.fullName}</span>
              <RoleBadge role={user.role} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
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
                  {theme === item.value && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
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
                  {lang === item.value && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="me-2 size-4" />
                  {t("Settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/logout">
                  <LogOut className="me-2 size-4" />
                  {t("Logout")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
