import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "@/app/pages/login";
import Logs from "@/app/pages/worksheets";
import Bills from "@/app/pages/bills";
import Cheques from "@/app/pages/cheques";
import Users from "@/app/pages/users";
import ManageUser from "@/app/pages/users/edit";
import Payee from "@/app/pages/payees";
import Settings from "@/app/pages/settings";

import PersistentLogin from "@/components/routing/persistent-login";
import RequireAuth from "@/components/routing/require-auth";
import NavLayout from "@/components/navbar/layout";

import NotFound from "./not-found";
import Unauthorized from "./unauthorized";
import Offline from "./offline";
import Logout from "./logout";

import { USER, ADMIN, MODERATOR } from "@/lib/constants";

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
        <Route element={<PersistentLogin />}>
          <Route path="/" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>
          <Route path="/" element={<NavLayout />}>
            <Route element={<RequireAuth />}>
              <Route path="/worksheets" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route element={<RequireAuth restrictedRoles={[USER]} />}>
              <Route path="/bills" element={<Bills />} />
              <Route path="/cheques" element={<Cheques />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={[ADMIN, MODERATOR]} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/payees" element={<Payee />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={[ADMIN]} />}>
              <Route path="/users/:userId" element={<ManageUser />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    )) || <Offline />
  );
}

export default App;
