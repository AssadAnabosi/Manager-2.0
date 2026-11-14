import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Archive,
  Check,
  Landmark,
  LogOut,
  Plus,
  Receipt,
  Search,
  User,
  Users,
} from "lucide-react";

import { useAuth } from "@/providers/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
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
  const { canWrite, canCreateUsers } = usePermissions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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
    setQuery("");
    fn();
  };
  // "add cheque 1234", or just "1234": offer to add a cheque with that serial
  const serial = canWrite ? query.match(/\d+/)?.[0] : undefined;
  const creates = [
    {
      show: canWrite,
      title: "Add worklog",
      path: "/worksheets",
      icon: Archive,
    },
    { show: canWrite, title: "Add bill", path: "/bills", icon: Receipt },
    { show: canWrite, title: "Add cheque", path: "/cheques", icon: Landmark },
    { show: canWrite, title: "Add payee", path: "/payees", icon: User },
    { show: canCreateUsers, title: "Add user", path: "/users", icon: Users },
  ].filter((item) => item.show);
  const pages = [
    ...navGroupsFor(user.role).flatMap((g) => g.items),
    SETTINGS_ITEM,
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground ms-auto h-10 gap-2 px-3 font-normal md:h-8 md:w-56 md:justify-start md:px-2 [&_svg]:size-5 md:[&_svg]:size-4"
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
      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogTitle className="sr-only">{t("Command menu")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("Search for a page or a setting")}
        </DialogDescription>
        <CommandInput
          placeholder={t("Search...")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!serial && <CommandEmpty>{t("No matching results")}</CommandEmpty>}
          {serial && (
            // forceMount on the group too: cmdk hides a group with no matching items
            <CommandGroup forceMount>
              <CommandItem
                forceMount
                value={`add cheque serial ${serial}`}
                onSelect={() =>
                  run(() => navigate(`/cheques?add=1&addSerial=${serial}`))
                }
              >
                <Plus />
                {t("Add cheque with serial {{serial}}", { serial })}
              </CommandItem>
            </CommandGroup>
          )}
          {creates.length > 0 && (
            <>
              <CommandGroup heading={t("Create")}>
                {creates.map((item) => (
                  <CommandItem
                    key={item.path}
                    value={`${t(item.title)} ${item.title}`}
                    onSelect={() => run(() => navigate(`${item.path}?add=1`))}
                  >
                    <item.icon />
                    {t(item.title)}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
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
