import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
// import SettingsGear from "@/components/component/settings-gear";
import Bills from "@/app/pages/bills";
import Cheques from "@/app/pages/cheques";
import App from "@/app";
import Login from "@/app/pages/login";
import Settings from "@/app/pages/settings";
import Logs from "@/app/pages/logs";
import "./index.css";
import Layout from "./app/layout";
import Users from "@/app/pages/users";
import NotFound from "./app/not_found";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<App />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/cheques" element={<Cheques />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          {/* <SettingsGear /> */}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
