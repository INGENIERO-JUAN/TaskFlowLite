import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Notes } from "./pages/Notes";
import { Habits } from "./pages/Habits";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestRoute } from "./components/GuestRoute";

/**
 * Configuración de rutas de la SPA.
 *
 * ┌─────────────────────────────────────────┐
 * │  /             → Landing (pública)       │
 * │  GuestRoute    → solo para no autenticados│
 * │    /login      → Login                  │
 * │    /register   → Register               │
 * │  ProtectedRoute→ solo para autenticados  │
 * │    /dashboard  → Dashboard              │
 * │    /notes      → Notes                  │
 * │    /habits     → Habits                 │
 * └─────────────────────────────────────────┘
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    Component: GuestRoute,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register },
    ],
  },
  {
    Component: ProtectedRoute,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "notes",     Component: Notes     },
      { path: "habits",    Component: Habits    },
    ],
  },
]);
