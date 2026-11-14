import { axios } from "@/hooks/use-axios";
import { UserType } from "@/lib/types";

/**
 * Restores the session from the refresh-token cookie once, at app boot.
 *
 * Kicked off from main.tsx *before* React renders so the request overlaps with
 * loading the bundle and translations. The promise is shared, so StrictMode
 * (or any other caller) can't fire it twice.
 */

export const IS_LOGGED_IN_KEY = "isLoggedIn";
const BOOT_TIMEOUT_MS = 8000;

export type BootError = { title: string; description: string };

export type BootResult =
  | { user: UserType; accessToken: string; error?: undefined }
  | { user?: undefined; accessToken?: undefined; error?: BootError };

/** Cheap, synchronous hint: did this browser sign in before? */
export const hasSessionHint = () => {
  try {
    return localStorage.getItem(IS_LOGGED_IN_KEY) === "true";
  } catch {
    return false;
  }
};

const clearSessionHint = () => {
  try {
    localStorage.removeItem(IS_LOGGED_IN_KEY);
  } catch {
    /* storage unavailable */
  }
};

const restore = async (): Promise<BootResult> => {
  // Never signed in here: nothing to restore, so don't make anyone wait.
  if (!hasSessionHint()) return {};

  try {
    const { data: response } = await axios.post(
      "/auth/refresh",
      {},
      { timeout: BOOT_TIMEOUT_MS }
    );
    const { user, accessToken } = response.data;
    return { user, accessToken };
  } catch (error: any) {
    // No response at all: server down, offline, or the timeout above.
    // Keep the hint so the next load tries again.
    if (!error?.response) {
      return {
        error: {
          title: "Server unreachable",
          description: "Sorry, server unreachable at the moment.",
        },
      };
    }

    // The server rejected the cookie (expired, revoked, deleted or deactivated
    // account). Drop the hint so later loads skip straight to the login page.
    clearSessionHint();
    const status = error.response.status;
    if (status === 401 || status === 403 || status === 404) {
      return {
        error: {
          title: "Session Expired",
          description: "Please login again.",
        },
      };
    }
    // 400 = no cookie at all: a stale hint, nothing to tell the user.
    return {};
  }
};

let bootPromise: Promise<BootResult> | null = null;

export const bootstrapSession = () => {
  bootPromise ??= restore();
  return bootPromise;
};
