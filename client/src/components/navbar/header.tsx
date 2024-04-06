import { useAuth } from "@/providers/auth-provider";

import { DashboardIcon } from "@radix-ui/react-icons";

import useScroll from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { CircleUser } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const Header = () => {
  const { user } = useAuth();
  const scrolled = useScroll(5);

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-border print:hidden`,
        {
          "border-b border-border bg-background/75 backdrop-blur-lg": scrolled,
        }
      )}
    >
      <div className="flex h-[47px] items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-row space-x-3 rtl:space-x-reverse items-center justify-center xl:hidden">
            <DashboardIcon className="h-7 w-7" />
            <span className="font-bold text-xl flex ">Dashboard</span>
          </div>
        </div>
        <div className="block ltr:pr-8 rtl:pl-8 xl:ltr:pr-0 xl:rtl:pl-0">
          {user ? (
            <div className="flex items-center flex-row-reverse">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <CircleUser className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>
              <div className="rtl:ml-4 ltr:mr-4 space-y-1">
                <p
                  className="text-sm font-medium leading-none"
                  aria-label="Full Name"
                >
                  {user.fullName}
                </p>
                <p
                  style={{ direction: "ltr" }}
                  className="text-sm text-muted-foreground"
                  aria-label="Username"
                >
                  @{user.username}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;
