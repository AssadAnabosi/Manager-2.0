import { ADMIN, MODERATOR, ROLES, SPECTATOR } from "@/lib/constants";
import {
  Archive,
  Receipt,
  Landmark,
  Users,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export type SideNavItem = {
  title: string;
  path: string;
  allowedRoles: string[];
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Worksheets",
    path: "/worksheets",
    icon: <Archive className="h-5 w-5 mr-5" />,
    allowedRoles: ROLES,
  },
  {
    title: "Bills",
    path: "/bills",
    icon: <Receipt className="h-5 w-5 mr-5" />,
    allowedRoles: [ADMIN, MODERATOR, SPECTATOR],
  },
  {
    title: "Cheques",
    path: "/cheques",
    icon: <Landmark className="h-5 w-5 mr-5" />,
    allowedRoles: [ADMIN, MODERATOR, SPECTATOR],
  },
  {
    title: "Users",
    path: "/users",
    icon: <Users className="h-5 w-5 mr-5" />,
    allowedRoles: [ADMIN, MODERATOR],
  },
  {
    title: "Payees",
    path: "/payees",
    icon: <User className="h-5 w-5 mr-5" />,
    allowedRoles: [ADMIN, MODERATOR],
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5 mr-5" />,
    allowedRoles: ROLES,
  },
  {
    title: "Logout",
    path: "/logout",
    icon: <LogOut className="h-5 w-5 mr-5" />,
    allowedRoles: ROLES,
  },
];
