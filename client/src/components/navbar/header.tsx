import { DashboardIcon } from "@radix-ui/react-icons";

import useScroll from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import SettingsGear from "@/components/component/settings-gear";

const Header = () => {
  const scrolled = useScroll(5);

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-border`,
        {
          "border-b border-border bg-background/75 backdrop-blur-lg": scrolled,
        }
      )}
    >
      <div className="flex h-[47px] items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-row space-x-3 items-center justify-center xl:hidden">
            <DashboardIcon className="h-7 w-7" />
            <span className="font-bold text-xl flex ">Anabosi</span>
          </div>
        </div>
        <div className="hidden xl:block">
          <SettingsGear />
        </div>
      </div>
    </div>
  );
};

export default Header;
