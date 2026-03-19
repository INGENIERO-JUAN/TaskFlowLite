/**
 * GuestRoute — Protege rutas exclusivas para usuarios NO autenticados.
 * Si el usuario YA está autenticado, redirige al dashboard.
 */
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
