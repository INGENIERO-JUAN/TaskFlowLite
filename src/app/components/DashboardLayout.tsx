/**
 * DashboardLayout — Layout anidado para todas las rutas protegidas.
 *
 * Funciones:
 *  - Valida la sesión (redirige a /login si no autenticado)
 *  - Renderiza NavbarAuth una sola vez para todas las rutas hijas
 *  - Usa <Outlet /> de React Router v7 para inyectar la página activa
 *  - Flicker-free: el estado ya está hidratado sincrónicamente en Zustand
 */
import { Navigate, Outlet } from "react-router";
import { NavbarAuth }       from "./NavbarAuth";
import { useAuthStore }     from "../stores/useAuthStore";

export function DashboardLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavbarAuth />
      <Outlet />
    </div>
  );
}
