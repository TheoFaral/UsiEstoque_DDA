import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

function ProtectedRoute() {
  const { usuario } = useAuth();

  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
