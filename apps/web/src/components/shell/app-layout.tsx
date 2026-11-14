import { Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreditsBadge } from "@/components/shell/credits-badge";
import { SHELL_STYLE, readSidebarOpen } from "@/components/shell/sidebar-state";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { SiteHeader } from "@/components/shell/site-header";

const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={readSidebarOpen()} style={SHELL_STYLE}>
      <AppSidebar variant="inset" />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-2 px-4 pt-2 pb-4 print:px-2">
          <Outlet />
        </main>
        <footer className="flex justify-center pb-3 print:hidden">
          <CreditsBadge />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
