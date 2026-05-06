/**
 * GuestRoute — Protege rutas exclusivas para usuarios NO autenticados.
 * Usa useAuthStore (Zustand) directamente — no depende de Context API.
 * Si el usuario YA está autenticado, redirige al dashboard.
 */
import { Navigate, Outlet } from "react-router";
import { useAuthStore }     from "../stores/useAuthStore";

export function GuestRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
