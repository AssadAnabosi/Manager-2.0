import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { MARK_SVG } from "@/components/shell/mark";
import { readThemeColors } from "@/lib/theme-color";

/**
 * Branded loading screen: the logo is revealed through a drop of glass (WebGL; a still logo where
 * that isn't available, and a still frame with reduced motion). Fades in only once the page has
 * been loading for 300ms, so fast loads never flash it. The static splash in index.html shows the
 * same logo, so the hand-off from HTML to React is seamless.
 */
const SHOW_AFTER_MS = 300;

const Loading = () => {
  // Timed from page start, not from mount: if the static HTML splash is already
  // showing, this one appears immediately instead of blinking out for 300ms.
  const delay = Math.max(0, SHOW_AFTER_MS - performance.now());
  // the canvas paints its own backdrop, so it has to match the page's
  const { dark, primary, background } = readThemeColors();
  return (
    <div
      role="status"
      aria-label="Loading"
      className="bg-background animate-in fade-in fill-mode-both fixed inset-0 z-50 duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <GlassIconReveal
        logo={MARK_SVG}
        look={dark ? "dark" : "light"}
        background={background}
        logoColor={primary}
        label="Loading"
        className="h-full w-full cursor-default"
        tuning={{ present: 1.6, glide: 1.6 }}
      />
    </div>
  );
};

export default Loading;
