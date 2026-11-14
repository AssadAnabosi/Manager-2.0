import { CSSProperties } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Brand } from "@/components/shell/brand";
import { readSidebarOpen } from "@/components/shell/sidebar-state";

/**
 * The app shell (sidebar, header, a table of rows) with skeletons in place of
 * content. Shown to returning users while their session is restored, so the
 * page appears to load in place instead of behind a blank spinner.
 *
 * Deliberately uses no router hooks and no translated text of its own: it also
 * serves as the Suspense fallback while translations load.
 */
const AppShellSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className="duration-200 animate-in fade-in"
    >
      <SidebarProvider
        defaultOpen={readSidebarOpen()}
        style={{ "--header-height": "3rem" } as CSSProperties}
      >
        <Sidebar
          side={document.documentElement.dir === "rtl" ? "right" : "left"}
          collapsible="icon"
          className="print:hidden"
        >
          <SidebarHeader className="h-[var(--header-height)] justify-center border-b border-sidebar-border">
            <Brand />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2 p-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-w-0">
          <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 print:hidden">
            <Skeleton className="h-7 w-7" />
            <Skeleton className="mx-2 h-4 w-px" />
            <Skeleton className="h-4 w-24" />
          </header>
          <main className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-2">
            <div className="flex items-center justify-between gap-2 py-2">
              <Skeleton className="h-10 w-full max-w-xs" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="rounded-md border border-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-[73px] items-center gap-4 border-b border-border px-4 last:border-b-0"
                >
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="w-32 shrink-0 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="hidden h-5 flex-1 rounded-full md:block" />
                  <Skeleton className="hidden h-5 flex-1 rounded-full lg:block" />
                </div>
              ))}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AppShellSkeleton;
