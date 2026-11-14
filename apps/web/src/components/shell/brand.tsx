import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { MARK_SVG } from "@/components/shell/mark";
import { useThemeColors } from "@/lib/theme-color";

/**
 * Logo and name. The logo plays the glass reveal on a loop, in the primary colour, over the
 * sidebar's own background (the canvas paints its backdrop, so it has to match). Presentational
 * on purpose: the boot skeleton renders it without translations, so callers pass a translated
 * `label` when they can.
 */
export function Brand({
  label = "Dashboard",
  surface = "sidebar",
}: {
  label?: string;
  /** What the logo sits on: the sidebar (default) or the plain page background. */
  surface?: "sidebar" | "page";
}) {
  const { dark, primary, sidebar, background } = useThemeColors();
  return (
    <div className="flex items-center gap-2">
      <GlassIconReveal
        logo={MARK_SVG}
        look={dark ? "dark" : "light"}
        background={surface === "page" ? background : sidebar}
        logoColor={primary}
        label=""
        aria-hidden
        className="size-8 shrink-0 cursor-default"
        tuning={{ present: 1.6, glide: 1.6 }}
      />
      <span className="truncate text-base font-semibold">{label}</span>
    </div>
  );
}
