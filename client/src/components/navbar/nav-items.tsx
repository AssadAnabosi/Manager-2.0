import {
  ArchiveIcon,
  GearIcon,
  PersonIcon,
  FileIcon,
  IdCardIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";

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
    icon: <ArchiveIcon className="h-5 w-5 mr-5" />,
  },
  {
    title: "Bills",
    path: "/bills",
    icon: <FileIcon className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Cheques",
    path: "/cheques",
    icon: <EnvelopeClosedIcon className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Users",
    path: "/users",
    icon: <IdCardIcon className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Payees",
    path: "/payees",
    icon: <PersonIcon className="h-5 w-5 mr-5" />,
    adminOnly: true,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <GearIcon className="h-5 w-5 mr-5" />,
  },
];
