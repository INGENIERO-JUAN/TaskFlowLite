/**
 * routes.tsx — Definición de rutas con React Router v7.
 *
 * Estructura:
 *  Rutas públicas:   /  /login  /register
 *  Rutas protegidas: /dashboard  /notes  /habits  /reports  /profile
 *    → Anidadas bajo DashboardLayout que incluye NavbarAuth + Outlet
 *
 * GuestRoute: redirige al dashboard si ya hay sesión activa
 * DashboardLayout: valida auth + renderiza NavbarAuth una sola vez
 */
import { createBrowserRouter } from "react-router";

import { Landing }          from "./pages/Landing";
import { Login }            from "./pages/Login";
import { Register }         from "./pages/Register";
import { Dashboard }        from "./pages/Dashboard";
import { Notes }            from "./pages/Notes";
import { Habits }           from "./pages/Habits";
import { Reports }          from "./pages/Reports";
import { Profile }          from "./pages/Profile";
import { NotFound }         from "./pages/NotFound";
import { DashboardLayout }  from "./components/DashboardLayout";
import { GuestRoute }       from "./components/GuestRoute";

export const router = createBrowserRouter([
  // ── Ruta pública raíz ──────────────────────────────────────────────────────
  { path: "/", Component: Landing },

  // ── Rutas solo para no autenticados ───────────────────────────────────────
  {
    Component: GuestRoute,
    children: [
      { path: "login",    Component: Login    },
      { path: "register", Component: Register },
    ],
  },

  // ── Rutas protegidas — DashboardLayout incluye NavbarAuth + Outlet ────────
  {
    Component: DashboardLayout,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "notes",     Component: Notes     },
      { path: "habits",    Component: Habits    },
      { path: "reports",   Component: Reports   },
      { path: "profile",   Component: Profile   },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────────────────────
  { path: "*", Component: NotFound },
]);
