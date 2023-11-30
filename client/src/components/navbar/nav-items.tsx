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
  adminOnly?: boolean;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Worksheets",
    path: "/worksheets",
    icon: <Archive className="h-5 w-5 mr-5" />,
  },
  {
    title: "Bills",
    path: "/bills",
    icon: <Receipt className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Cheques",
    path: "/cheques",
    icon: <Landmark className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Users",
    path: "/users",
    icon: <Users className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Payees",
    path: "/payees",
    icon: <User className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5 mr-5" />,
  },
  {
    title: "Logout",
    path: "/logout",
    icon: <LogOut className="h-5 w-5 mr-5" />,
  },
];
