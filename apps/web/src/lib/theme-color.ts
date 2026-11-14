import { useEffect, useState } from "react";

/** Any CSS colour the browser understands as #rrggbb (what the glass canvas wants). */
export function toHex(color: string): string {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** The colours the animated logo needs, read from the theme tokens. */
export function readThemeColors() {
  return {
    dark: document.documentElement.classList.contains("dark"),
    // `--primary` is bare HSL numbers ("0 72.2% 50.6%"); `--sidebar` is a full colour
    primary: toHex(`hsl(${token("--primary")})`),
    sidebar: toHex(token("--sidebar")),
    background: toHex(`hsl(${token("--background")})`),
  };
}

/** The theme colours, re-read whenever the light/dark class on <html> changes. */
export function useThemeColors() {
  const [colors, setColors] = useState(readThemeColors);
  useEffect(() => {
    const update = () => setColors(readThemeColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return colors;
}
