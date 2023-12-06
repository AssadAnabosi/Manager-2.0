import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SIDENAV_ITEMS, SideNavItem } from "./nav-items";
import { useAuth } from "@/providers/auth-provider";

import {
  ChevronDownIcon,
  DashboardIcon,
  IdCardIcon,
} from "@radix-ui/react-icons";

const SideNav = () => {
  const { user } = useAuth();
  return (
    <nav className="xl:w-60 bg-background h-screen flex-1 fixed border-border hidden xl:flex ltr:border-r rtl:border-l">
      <div className="flex flex-col space-y-6 w-full h-full">
        <div className="h-12 flex bg-background flex-row space-x-3 rtl:space-x-reverse items-center justify-center xl:justify-start xl:px-6 border-b border-border w-full">
          <DashboardIcon className="h-7 w-7" />
          <span className="font-bold text-xl hidden xl:flex">Dashboard</span>
        </div>
        <div className="flex flex-col justify-between h-[92%]">
          <div className="flex flex-col space-y-2 xl:px-6 ">
            {SIDENAV_ITEMS.map((item, idx) => {
              return <MenuItem role={user?.role} key={idx} item={item} />;
            })}
          </div>
          {user && (
            <div className="w-full">
              <Card className="mx-3">
                <CardContent className="my-auto p-5">
                  <div className="items-center flex">
                    <Avatar className="h-9 w-9">
                      <AvatarImage alt="Avatar" />
                      <AvatarFallback>
                        <IdCardIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="ltr:ml-2 rtl:mr-2 space-y-1">
                      <p
                        className="text-sm font-medium leading-none"
                        aria-label="Full Name"
                      >
                        {user.fullName}
                      </p>
                      <p
                        style={{ direction: "ltr" }}
                        className="text-sm text-muted-foreground rtl:text-right"
                        aria-label="Username"
                      >
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* <p
                style={{ direction: "ltr" }}
                className="text-xs text-center pt-1"
              >
                &copy; {new Date().getFullYear()}
              </p> */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SideNav;

const MenuItem = ({
  item,
  role,
}: {
  item: SideNavItem;
  role: string | undefined;
}) => {
  const { t } = useTranslation();
  const pathname = useLocation().pathname;
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  return !item.allowedRoles.includes(role as string) ? null : (
    <div className="">
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-xl w-full justify-between hover-bg-primary/90 ${
              pathname.includes(item.path) ? "bg-primary" : ""
            }`}
          >
            <div className="flex flex-row space-x-4 rtl:space-x-reverse items-center">
              {item.icon}
              <span className="font-semibold text-xl  flex">
                {t(item.title)}
              </span>
            </div>

            <div
              className={`${
                subMenuOpen ? "rotate-180" : ""
              } flex transition-all `}
            >
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </button>

          {subMenuOpen && (
            <>
              <div className="my-2 ml-12 flex flex-col space-y-4">
                {item.subMenuItems?.map((subItem, idx) => {
                  return (
                    <Link
                      key={idx}
                      to={subItem.path}
                      className={`${
                        subItem.path === pathname ? "font-bold" : ""
                      }`}
                    >
                      <span>{t(subItem.title)}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : (
        <Link
          to={item.path}
          className={`border-border flex flex-row space-x-4 rtl:space-x-reverse items-center p-2 rounded-xl hover:bg-primary/90 hover:text-primary-foreground ${
            item.path === pathname ? "bg-primary text-primary-foreground" : ""
          } ${item.title === "Logout" ? "mt-5" : ""}`}
        >
          {item.icon}
          <span className="font-semibold text-xl flex">{t(item.title)}</span>
        </Link>
      )}
    </div>
  );
};
