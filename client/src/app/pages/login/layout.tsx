import { ReactNode } from "react";
import { DashboardIcon } from "@radix-ui/react-icons";
import PageWrapper from "@/components/navbar/page-wrapper";
import FooterHoverCard from "@/components/component/footer-hover-card";
import SettingsGear from "@/components/component/settings-gear";
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex-1">
      <div className="flex flex-col min-h-screen">
        <div className="sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-border">
          <div className="flex h-[47px] items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <DashboardIcon className="h-7 w-7" />
              <span className="font-bold text-xl flex ">Anabosi</span>
            </div>
            <div>
              <SettingsGear />
            </div>
          </div>
        </div>
        <PageWrapper>{children}</PageWrapper>
        <footer className="footer text-sm mx-auto">
          <p className="text-sm">
            Made with ❤️ by <FooterHoverCard />
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
