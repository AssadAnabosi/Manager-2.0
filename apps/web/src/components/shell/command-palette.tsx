import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Archive,
  Check,
  Keyboard,
  Landmark,
  LogOut,
  Plus,
  Receipt,
  Search,
  User,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useGoTo } from "@/hooks/use-remembered-filters";
import { useAuth } from "@/providers/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SETTINGS_ITEM, navGroupsFor } from "@/components/shell/nav-items";
import { LANGUAGES, THEMES } from "@/components/shell/nav-user";
import {
  isHelpKey,
  isLetter,
  letterOf,
  normalizeQuery,
  punctuationOf,
} from "@/lib/shortcuts";

const isMac = () =>
  typeof navigator !== "undefined" &&
  /mac|iphone|ipad/i.test(navigator.platform);

/** Always the last row once something is typed: search the bills for it. Its value never matches the filter, so it is only there because of forceMount. */
function SearchBillsFallback({
  query,
  onSelect,
}: {
  query: string;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <CommandGroup forceMount>
      <CommandItem forceMount value={"\u0000"} onSelect={onSelect}>
        <Search />
        {t('Search bills for "{{query}}"', { query })}
      </CommandItem>
    </CommandGroup>
  );
}

type Shortcut = {
  keys: string[];
  label: string;
  /** Hidden for roles without this access. */
  needs?: "cheques" | "billWrite" | "write";
};

const SHORTCUT_GROUPS: { title: string; wide?: boolean; items: Shortcut[] }[] =
  [
    {
      title: "General",
      items: [
        { keys: ["mod", "K"], label: "Open the command menu" },
        { keys: ["mod", "\\"], label: "Show or hide the sidebar" },
        { keys: ["mod", "B"], label: "Show or hide the sidebar" },
        { keys: ["?"], label: "Show this list" },
      ],
    },
    {
      title: "Navigation",
      items: [
        { keys: ["g", "w"], label: "Go to a page by its first letter" },
        {
          keys: ["alt", "1-9"],
          label: "Go to the sidebar item with that number",
        },
        { keys: ["alt", "N"], label: "Open Add New on the current page", needs: "write" },
        { keys: ["alt", "S"], label: "In a form dialog: save", needs: "write" },
        { keys: ["alt", "E"], label: "In a details dialog: edit", needs: "write" },
        { keys: ["alt", "D"], label: "In a details dialog: delete", needs: "write" },
        { keys: ["alt", "L"], label: "Worksheets: show the list" },
        { keys: ["alt", "C"], label: "Worksheets: show the calendar" },
        { keys: ["["], label: "Go to the previous sidebar item" },
        { keys: ["]"], label: "Go to the next sidebar item" },
      ],
    },
    {
      title: "Type these in the command menu",
      wide: true,
      items: [
        {
          keys: ["c", "123"],
          label: "Add or search a cheque by serial",
          needs: "cheques",
        },
        { keys: ["b", "250"], label: "Add a spent bill", needs: "billWrite" },
        {
          keys: ["b", "-250"],
          label: "Add a received bill",
          needs: "billWrite",
        },
      ],
    },
  ];

/** The letter after `g` for each page; a page the role can't open is skipped. */
const GO_TO: Record<string, string> = {
  d: "/",
  w: "/worksheets",
  b: "/bills",
  c: "/cheques",
  p: "/payees",
  u: "/users",
  s: "/settings",
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(input|textarea|select)$/i.test(target.tagName));

/**
 * Ctrl/⌘+K opens a search box for jumping to a page or changing the theme and language. The
 * button next to it is for phones and for finding the shortcut.
 */
export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const goTo = useGoTo();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { canWrite, canCreateUsers } = usePermissions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  // what the key handler needs to move through the sidebar, kept fresh on every render
  const goPending = useRef(0);
  const sidebar = useRef<{ paths: string[]; current: string }>({
    paths: [],
    current: "",
  });
  const lang = (i18n.resolvedLanguage ?? "en").substring(0, 2);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isLetter(e, "k") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (
        isHelpKey(e) &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTyping(e.target)
      ) {
        e.preventDefault();
        setHelpOpen((o) => !o);
      } else if (!e.metaKey && !e.ctrlKey && !isTyping(e.target)) {
        const { paths, current } = sidebar.current;
        let target: string | undefined;
        // g then a letter (within 1.5s): jump to that page
        const waiting = goPending.current;
        goPending.current = 0;
        if (!e.altKey && !e.shiftKey && letterOf(e).length === 1) {
          const key = letterOf(e);
          if (waiting && Date.now() - waiting < 1500) {
            const to = GO_TO[key];
            if (to && (to === "/" || paths.includes(to))) target = to;
          } else if (key === "g") {
            goPending.current = Date.now();
          }
        }
        // Alt+1..9: the nth sidebar item (by position, so it follows the user's role)
        const digit = e.altKey && e.code.match(/^Digit([1-9])$/)?.[1];
        if (!target && digit) target = paths[Number(digit) - 1];
        // [ and ]: the previous / next sidebar item, wrapping around
        const bracket = punctuationOf(e);
        if (!target && !e.altKey && (bracket === "[" || bracket === "]")) {
          const at = paths.findIndex(
            (path) => current === path || current.startsWith(path + "/")
          );
          if (at !== -1)
            target =
              paths[
                (at + (bracket === "]" ? 1 : -1) + paths.length) % paths.length
              ];
        }
        if (target) {
          e.preventDefault();
          // already there: going again would wipe the page's filters and view
          if (target !== current) goTo(target);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [goTo]);

  if (!user) return null;

  const run = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    fn();
  };
  // "c1234": add a cheque with that serial (always first), or look for one
  // (typed on an Arabic keyboard it is ؤ250, which reads the same)
  const typedQuery = normalizeQuery(query).trim();
  const serial = typedQuery.match(/^c\s*(\d+)$/i)?.[1];
  // "b250" is a spent bill, "b-250" a received one
  const billMatch = typedQuery.match(/^b\s*(-?)(\d+(?:\.\d+)?)$/i);
  const bill = billMatch
    ? { amount: billMatch[2], received: billMatch[1] === "-" }
    : undefined;
  const text = query.trim();
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
  // Typing the start of "logout" brings it to the top; otherwise it stays at the bottom.
  const typed = text.toLowerCase();
  const logoutFirst =
    typed.length >= 2 &&
    [t("Logout"), "logout", "sign out"].some((word) =>
      word.toLowerCase().startsWith(typed)
    );
  const logoutItem = (
    <CommandItem
      forceMount={logoutFirst}
      value={`${t("Logout")} Logout sign out`}
      onSelect={() => run(() => navigate("/logout"))}
    >
      <LogOut />
      {t("Logout")}
    </CommandItem>
  );
  const hasPage = (path: string) => pages.some((page) => page.path === path);
  const allowed = {
    cheques: hasPage("/cheques"),
    billWrite: canWrite && hasPage("/bills"),
    write: canWrite,
  };
  const shortcutGroups = SHORTCUT_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.needs || allowed[item.needs]),
  })).filter((group) => group.items.length > 0);
  sidebar.current = {
    paths: pages.map((page) => page.path),
    current: pathname,
  };

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
          {logoutFirst && <CommandGroup forceMount>{logoutItem}</CommandGroup>}
          {/* forceMount on the group too: cmdk hides a group with no matching items */}
          {serial && allowed.cheques && (
            <CommandGroup forceMount>
              {canWrite && (
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
              )}
              <CommandItem
                forceMount
                value={`search cheque serial ${serial}`}
                onSelect={() =>
                  run(() => navigate(`/cheques?serial=${serial}`))
                }
              >
                <Search />
                {t("Search cheques with serial {{serial}}", { serial })}
              </CommandItem>
            </CommandGroup>
          )}
          {bill && allowed.billWrite && (
            <CommandGroup forceMount>
              <CommandItem
                forceMount
                value={`add bill ${bill.amount}`}
                onSelect={() =>
                  run(() =>
                    navigate(
                      `/bills?add=1&addAmount=${bill.amount}&addType=${
                        bill.received ? "income" : "expense"
                      }`
                    )
                  )
                }
              >
                <Plus />
                {t(
                  bill.received
                    ? "Add received bill of {{amount}}"
                    : "Add spent bill of {{amount}}",
                  { amount: bill.amount }
                )}
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
                onSelect={() => run(() => goTo(page.path))}
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
                {theme === item.value && <Check className="size-5! stroke-3" />}
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
                {lang === item.value && <Check className="size-5! stroke-3" />}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              value={`${t("Keyboard shortcuts")} Keyboard shortcuts help`}
              onSelect={() => run(() => setHelpOpen(true))}
            >
              <Keyboard />
              <span className="flex-1">{t("Keyboard shortcuts")}</span>
              <kbd className="bg-muted rounded border px-1.5 text-[10px] font-medium">
                ?
              </kbd>
            </CommandItem>
            {!logoutFirst && logoutItem}
          </CommandGroup>
          {text && hasPage("/bills") && (
            <SearchBillsFallback
              query={text}
              onSelect={() =>
                run(() => navigate(`/bills?search=${encodeURIComponent(text)}`))
              }
            />
          )}
        </CommandList>
      </CommandDialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pe-10 text-start">
            <DialogTitle>{t("Keyboard shortcuts")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("Type these in the command menu")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {shortcutGroups.map((group) => (
              <section
                key={group.title}
                className={cn(
                  "bg-muted/30 space-y-3 rounded-lg border p-4",
                  group.wide && "md:col-span-2"
                )}
              >
                <h3 className="text-muted-foreground text-xs font-medium">
                  {t(group.title)}
                </h3>
                <ul className="space-y-3 text-sm">
                  {group.items.map((item) => (
                    <li
                      key={item.keys.join("+")}
                      className="flex items-center gap-2"
                    >
                      <span className="font-medium">{t(item.label)}</span>
                      <span className="border-muted-foreground/30 min-w-4 flex-1 translate-y-1 border-b border-dotted" />
                      <bdi
                        dir="ltr"
                        className="flex shrink-0 gap-1 whitespace-nowrap"
                      >
                        {item.keys.map((key) => (
                          <kbd
                            key={key}
                            className="bg-muted min-w-6 shrink-0 rounded border border-b-2 px-1.5 py-0.5 text-center font-mono text-xs whitespace-nowrap"
                          >
                            {key === "mod"
                              ? isMac()
                                ? "⌘"
                                : "Ctrl"
                              : key === "alt"
                                ? isMac()
                                  ? "⌥"
                                  : "Alt"
                                : key}
                          </kbd>
                        ))}
                      </bdi>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
