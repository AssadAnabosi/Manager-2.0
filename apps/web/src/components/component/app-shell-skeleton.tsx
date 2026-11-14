import { DashboardIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import MarginWidthWrapper from "@/components/navbar/margin-width-wrapper";
import PageWrapper from "@/components/navbar/page-wrapper";

/**
 * The app's layout (side nav, header, a table of rows) with skeletons in place
 * of content. Shown to returning users while their session is restored, so the
 * page appears to load in place instead of behind a blank spinner.
 *
 * Deliberately uses no translations or router hooks: it also serves as the
 * Suspense fallback while translations load.
 */
const AppShellSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className="duration-200 animate-in fade-in"
    >
      <aside className="flex print:hidden">
        <nav className="fixed hidden h-screen flex-1 border-border bg-background xl:flex xl:w-60 ltr:border-r rtl:border-l">
          <div className="flex h-full w-full flex-col space-y-6">
            <div className="flex h-12 w-full flex-row items-center space-x-3 border-b border-border xl:justify-start xl:px-6 rtl:space-x-reverse">
              <DashboardIcon className="h-7 w-7" />
              <span className="hidden text-xl font-bold xl:flex">
                Dashboard
              </span>
            </div>
            <div className="flex flex-col space-y-4 xl:px-6">
              {[28, 24, 26, 20, 22].map((w, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-5" style={{ width: `${w * 4}px` }} />
                </div>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex-1">
        <MarginWidthWrapper>
          <div className="sticky inset-x-0 top-0 z-30 w-full border-b border-border">
            <div className="flex h-[47px] items-center justify-between px-4">
              <div className="flex flex-row items-center space-x-3 xl:invisible rtl:space-x-reverse">
                <DashboardIcon className="h-7 w-7" />
                <span className="flex text-xl font-bold">Dashboard</span>
              </div>
              <div className="flex items-center gap-4 ltr:pr-8 xl:ltr:pr-0 rtl:pl-8 xl:rtl:pl-0">
                <div className="hidden space-y-1.5 sm:block">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
          <PageWrapper>
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
          </PageWrapper>
        </MarginWidthWrapper>
      </div>
    </div>
  );
};

export default AppShellSkeleton;
