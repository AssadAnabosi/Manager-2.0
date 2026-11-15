import { useAuth } from "@/providers/auth-context";
import { useAltHeld } from "@/hooks/use-alt-held";
import { SETTINGS_ITEM, navGroupsFor } from "@/components/shell/nav-items";
import { useSidebar } from "@/components/ui/sidebar";

/** The sidebar's pages in order; the position is the page's Alt+number. */
export const sidebarPaths = (role: string | undefined) => [
  ...navGroupsFor(role).flatMap((group) => group.items.map((i) => i.path)),
  SETTINGS_ITEM.path,
];

/** While Alt is held, the number that opens this sidebar item. */
export function ShortcutNumber({ path }: { path: string }) {
  const altHeld = useAltHeld();
  const { state, isMobile } = useSidebar();
  const role = useAuth().user?.role;
  if (!altHeld || (!isMobile && state === "collapsed")) return null;
  const number = sidebarPaths(role).indexOf(path) + 1;
  if (number < 1 || number > 9) return null;
  return (
    <kbd
      dir="ltr"
      className="bg-muted text-muted-foreground ms-auto min-w-5 rounded border border-b-2 px-1 text-center font-mono text-xs"
    >
      {number}
    </kbd>
  );
}
