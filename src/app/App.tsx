/**
 * App.tsx - Punto de entrada de la aplicacion.
 *
 * Con Zustand ya no se necesita AuthProvider.
 * El estado de autenticacion se hidrata sincronicamente en el store
 * (flicker-free: si hay sesion en localStorage se carga antes del primer render).
 *
 * Toaster de Sonner: notificaciones globales de exito/error/info.
 */
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import React from "react";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: { fontFamily: "inherit" },
        }}
      />
    </>
  );
}
