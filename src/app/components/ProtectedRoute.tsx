/**
 * ProtectedRoute — Protege rutas que requieren autenticación.
 * Usa useAuthStore (Zustand) directamente — no depende de Context API.
 * Si el usuario NO está autenticado, redirige a /login.
 */
import { Navigate, Outlet } from "react-router";
import { useAuthStore }     from "../stores/useAuthStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
