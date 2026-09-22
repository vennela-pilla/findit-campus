import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

// Guards admin-only pages on the frontend. This is purely a UX
// convenience — the backend's adminMiddleware is the real gatekeeper.
const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default AdminRoute;
