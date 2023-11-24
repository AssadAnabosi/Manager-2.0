import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";

import Login from "@/app/pages/login";
import Logs from "@/app/pages/logs";
import Bills from "@/app/pages/bills";
import Cheques from "@/app/pages/cheques";
import Users from "@/app/pages/users";
import Payee from "@/app/pages/payees";
import Settings from "@/app/pages/settings";

import App from "@/app";
import "./index.css";

import Layout from "./app/layout";
import NotFound from "./app/not_found";
import { Toaster } from "@/components/ui/toaster";

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
              <Route path="/payees" element={<Payee />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
