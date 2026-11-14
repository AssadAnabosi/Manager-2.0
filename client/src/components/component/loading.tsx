import { DashboardIcon } from "@radix-ui/react-icons";

/**
 * Branded splash: logo + small spinner. Fades in only once the page has been
 * loading for 300ms, so fast loads never flash it. Matches the static splash in index.html, so the hand-off
 * from HTML to React is seamless.
 */
const SHOW_AFTER_MS = 300;

const Loading = () => {
  // Timed from page start, not from mount: if the static HTML splash is already
  // showing, this one appears immediately instead of blinking out for 300ms.
  const delay = Math.max(0, SHOW_AFTER_MS - performance.now());
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background duration-300 animate-in fade-in fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <DashboardIcon className="h-8 w-8" />
          <span className="text-2xl font-bold" dir="ltr">
            Dashboard
          </span>
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    </div>
  );
};

export default Loading;
