import { CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import FooterHoverCard from "@/components/component/footer-hover-card";
import { readSidebarOpen } from "./sidebar-state";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

const AppLayout = () => {
  const { t } = useTranslation();
  return (
    <SidebarProvider
      defaultOpen={readSidebarOpen()}
      style={{ "--header-height": "3rem" } as CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-2 print:px-2">
          <Outlet />
        </main>
        <footer className="footer mx-auto text-sm print:hidden">
          {t("Made with ❤️ by")} <FooterHoverCard />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
