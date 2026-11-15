import { useSyncExternalStore } from "react";

let held = false;
const listeners = new Set<() => void>();

const set = (next: boolean) => {
  if (held === next) return;
  held = next;
  listeners.forEach((listener) => listener());
};

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Alt") set(true);
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Alt") set(false);
  });
  // releasing Alt in another window never reaches us
  window.addEventListener("blur", () => set(false));
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Whether the Alt key is down right now. */
export const useAltHeld = () =>
  useSyncExternalStore(
    subscribe,
    () => held,
    () => false
  );
