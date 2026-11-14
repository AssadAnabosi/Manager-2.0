import "./index.css";
import i18n from "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";

import App from "@/app";

import { Toaster } from "@/components/ui/toaster";
import BootFallback from "@/components/component/boot-fallback";
import { bootstrapSession } from "@/lib/session";
import { ErrorProvider } from "./providers/error-provider";

i18n.on("languageChanged", (locale) => {
  let lang = locale.substring(0, 2);
  let dir = i18n.dir(locale);
  const allowedLangs = ["en", "ar"];
  if (!allowedLangs.includes(lang)) {
    lang = "en";
    dir = "ltr";
  }

  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: 1000 * 15,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
    },
  },
});

// Start restoring the session now, in parallel with loading translations and
// rendering, instead of waiting for the router to mount.
void bootstrapSession();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <ErrorProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <React.Suspense fallback={<BootFallback />}>
                <App />
                <Toaster />
              </React.Suspense>
            </BrowserRouter>
          </QueryClientProvider>
        </ErrorProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
