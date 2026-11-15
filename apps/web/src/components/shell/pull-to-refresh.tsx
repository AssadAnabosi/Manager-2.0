import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** How far (px) the shell follows the finger at most, and how far it must be pulled to reload. */
const MAX_PULL = 96;
const TRIGGER = 64;
/** The finger travels further than the shell does. */
const RESISTANCE = 0.5;

type Phase = "idle" | "pull" | "ready" | "refreshing";

/** Whether something between the touch and the page is itself scrolled down. */
const scrolledWithin = (target: EventTarget | null) => {
  for (
    let el = target instanceof Element ? target : null;
    el && el !== document.body;
    el = el.parentElement
  ) {
    if (el.scrollTop > 0) return true;
  }
  return false;
};

/**
 * Pull down at the top of a page to reload it. The whole shell, header included, follows the
 * finger and uncovers the hint behind it.
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const shell = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    let startY: number | null = null;
    let startX = 0;
    let pull = 0;
    let current: Phase = "idle";

    const move = (to: number, animate: boolean) => {
      el.style.transition = animate ? "transform 200ms ease-out" : "none";
      el.style.transform = to ? `translateY(${to}px)` : "";
    };
    const change = (next: Phase) => {
      if (next === current) return;
      current = next;
      setPhase(next);
    };

    const onStart = (e: TouchEvent) => {
      startY = null;
      if (current === "refreshing" || e.touches.length !== 1) return;
      // not while a dialog or the sidebar sheet is open, nor on a page that is scrolled
      if (window.scrollY > 0 || document.querySelector("[role=dialog]")) return;
      if (scrolledWithin(e.target)) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      pull = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      const dx = e.touches[0].clientX - startX;
      if (dy <= 0 || window.scrollY > 0 || Math.abs(dx) > dy) {
        if (pull) move(0, true);
        pull = 0;
        change("idle");
        if (dy <= 0) startY = null;
        return;
      }
      if (e.cancelable) e.preventDefault();
      pull = Math.min(dy * RESISTANCE, MAX_PULL);
      move(pull, false);
      change(pull >= TRIGGER ? "ready" : "pull");
    };
    const onEnd = () => {
      if (startY === null) return;
      startY = null;
      if (current === "ready") {
        change("refreshing");
        move(TRIGGER, true);
        window.location.reload();
      } else {
        move(0, true);
        change("idle");
      }
      pull = 0;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    // not passive: a pull must not also scroll or rubber-band the page
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={phase === "idle"}
        className={cn(
          "text-primary pointer-events-none fixed inset-x-0 top-0 z-0 flex h-24 items-end justify-center gap-2 pb-4 text-sm font-medium transition-opacity print:hidden",
          phase === "idle" ? "opacity-0" : "opacity-100"
        )}
      >
        {phase === "refreshing" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowDown
            className={cn(
              "size-4 transition-transform",
              phase === "ready" && "rotate-180"
            )}
          />
        )}
        {phase === "refreshing"
          ? `${t("Refreshing")}...`
          : phase === "ready"
            ? t("Release to refresh")
            : t("Pull down to refresh")}
      </div>
      <div ref={shell} className="bg-background relative z-10">
        {children}
      </div>
    </>
  );
}
