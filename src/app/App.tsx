import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes";

/**
 * Punto de entrada de la aplicación.
 * AuthProvider envuelve todo para que cualquier componente
 * pueda acceder al estado global de autenticación via useAuth().
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
