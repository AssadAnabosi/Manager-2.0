import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Receipt,
  Landmark,
  Settings,
  Users,
  User,
} from "lucide-react";
import { ADMIN, MODERATOR, ROLES, SPECTATOR } from "@/lib/constants";

export type NavItem = {
  /** English source string; translated where rendered. */
  title: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: string[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Records",
    items: [
      {
        title: "Worksheets",
        path: "/worksheets",
        icon: Archive,
        allowedRoles: ROLES,
      },
      {
        title: "Bills",
        path: "/bills",
        icon: Receipt,
        allowedRoles: [ADMIN, MODERATOR, SPECTATOR],
      },
      {
        title: "Cheques",
        path: "/cheques",
        icon: Landmark,
        allowedRoles: [ADMIN, MODERATOR, SPECTATOR],
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        title: "Users",
        path: "/users",
        icon: Users,
        allowedRoles: [ADMIN, MODERATOR],
      },
      {
        title: "Payees",
        path: "/payees",
        icon: User,
        allowedRoles: [ADMIN, MODERATOR],
      },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  title: "Settings",
  path: "/settings",
  icon: Settings,
  allowedRoles: ROLES,
};

/** Groups with only the items the role may open; empty groups are dropped. */
export function navGroupsFor(role: string | undefined): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.allowedRoles.includes(role as string)
    ),
  })).filter((group) => group.items.length > 0);
}

/** The nav item whose section contains `pathname` (e.g. /users/123 -> Users). */
export function navItemFor(pathname: string): NavItem | undefined {
  return [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM].find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
}
