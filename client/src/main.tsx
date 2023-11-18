import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/context/theme-provider";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
