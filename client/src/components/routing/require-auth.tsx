import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";

const RequireAuth = ({
  allowedRoles,
  restrictedRoles,
}: {
  allowedRoles?: string[];
  restrictedRoles?: string[];
}) => {
  const { user } = useAuth();
  const location = useLocation();
  return user ? (
    // logged in? Check role
    !restrictedRoles?.includes(user?.role) ||
    allowedRoles?.includes(user?.role) ? (
      // YES? Render route
      <Outlet />
    ) : (
      // Not allowed, but logged in?
      <Navigate to="/unauthorized" state={{ from: location }} replace />
    )
  ) : (
    // Not logged in? Redirect to login
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;
