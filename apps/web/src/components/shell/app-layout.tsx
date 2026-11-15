import { Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SHELL_STYLE, readSidebarOpen } from "@/components/shell/sidebar-state";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { SiteHeader } from "@/components/shell/site-header";
import { FiltersRestoredBanner } from "@/components/shell/filters-restored-banner";
import { useRememberedFilters } from "@/hooks/use-remembered-filters";

const AppLayout = () => {
  useRememberedFilters();
  return (
    <SidebarProvider defaultOpen={readSidebarOpen()} style={SHELL_STYLE}>
      <AppSidebar variant="inset" />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <FiltersRestoredBanner />
        <main className="flex flex-1 flex-col gap-2 px-4 pt-2 pb-4 print:px-2">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
