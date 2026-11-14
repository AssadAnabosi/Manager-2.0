import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, LogOut, Search } from "lucide-react";

import { useAuth } from "@/providers/auth-context";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SETTINGS_ITEM, navGroupsFor } from "@/components/shell/nav-items";
import { LANGUAGES, THEMES } from "@/components/shell/nav-user";

const isMac = () =>
  typeof navigator !== "undefined" &&
  /mac|iphone|ipad/i.test(navigator.platform);

/**
 * Ctrl/⌘+K opens a search box for jumping to a page or changing the theme and language. The
 * button next to it is for phones and for finding the shortcut.
 */
export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const lang = (i18n.resolvedLanguage ?? "en").substring(0, 2);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!user) return null;

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  const pages = [
    ...navGroupsFor(user.role).flatMap((g) => g.items),
    SETTINGS_ITEM,
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground ms-auto h-8 gap-2 px-2 font-normal md:w-56 md:justify-start"
        onClick={() => setOpen(true)}
      >
        <Search />
        <span className="hidden flex-1 text-start md:inline">
          {t("Search...")}
        </span>
        <kbd className="bg-muted hidden rounded border px-1.5 text-[10px] font-medium md:inline">
          <bdi dir="ltr">{isMac() ? "⌘ K" : "Ctrl K"}</bdi>
        </kbd>
        <span className="sr-only md:hidden">{t("Search...")}</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">{t("Command menu")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("Search for a page or a setting")}
        </DialogDescription>
        <CommandInput placeholder={t("Search...")} />
        <CommandList>
          <CommandEmpty>{t("No matching results")}</CommandEmpty>
          <CommandGroup heading={t("Pages")}>
            {pages.map((page) => (
              <CommandItem
                key={page.path}
                value={`${t(page.title)} ${page.title}`}
                onSelect={() => run(() => navigate(page.path))}
              >
                <page.icon />
                {t(page.title)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("Theme")}>
            {THEMES.map((item) => (
              <CommandItem
                key={item.value}
                value={`${t("Theme")} ${t(item.label)} ${item.label}`}
                onSelect={() => run(() => setTheme(item.value))}
              >
                <span className="flex-1">{t(item.label)}</span>
                {theme === item.value && <Check />}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("Language")}>
            {LANGUAGES.map((item) => (
              <CommandItem
                key={item.value}
                value={`${t("Language")} ${item.label} ${item.value}`}
                onSelect={() => run(() => i18n.changeLanguage(item.value))}
              >
                <span className="flex-1">{item.label}</span>
                {lang === item.value && <Check />}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              value={`${t("Logout")} Logout sign out`}
              onSelect={() => run(() => navigate("/logout"))}
            >
              <LogOut />
              {t("Logout")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
