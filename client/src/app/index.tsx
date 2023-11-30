import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "@/app/pages/login";
import Logs from "@/app/pages/timesheets";
import Bills from "@/app/pages/bills";
import Cheques from "@/app/pages/cheques";
import Users from "@/app/pages/users";
import Payee from "@/app/pages/payees";
import Settings from "@/app/pages/settings";

import RequireAuth from "@/components/component/require-auth";

import NavLayout from "@/components/navbar/layout";
import NotFound from "./not-found";
import Unauthorized from "./unauthorized";
import Offline from "./offline";

import { USER } from "@/lib/constants";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function onlineHandler() {
      setIsOnline(true);
    }

    function offlineHandler() {
      setIsOnline(false);
    }

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  return (
    (isOnline && (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/" element={<NavLayout />}>
          <Route element={<RequireAuth />}>
            <Route path="/worksheets" element={<Logs />} />
          </Route>
          <Route element={<RequireAuth restrictedRoles={[USER]} />}>
            <Route path="/bills" element={<Bills />} />
            <Route path="/cheques" element={<Cheques />} />
            <Route path="/users" element={<Users />} />
            <Route path="/payees" element={<Payee />} />
          </Route>
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )) || <Offline />
  );
}

export default App;
