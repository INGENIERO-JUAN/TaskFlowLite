/**
 * NotFound Page — Página 404 personalizada.
 * Dark mode completo.
 */
import React from "react";
import { useNavigate } from "react-router";
import { Zap, Home, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

export function NotFound() {
  const navigate         = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-gray-900 dark:text-white font-bold text-lg">
          TaskFlow <span className="text-blue-600">Lite</span>
        </span>
      </div>

      {/* Ilustración */}
      <div className="relative mb-8 select-none">
        <p className="text-center font-black leading-none text-gray-200 dark:text-gray-800" style={{ fontSize: "8rem" }}>
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
            <SearchX size={36} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Texto */}
      <h1 className="text-gray-900 dark:text-white text-2xl text-center mb-3 font-extrabold">
        Página no encontrada
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-sm mb-8" style={{ lineHeight: 1.7 }}>
        La ruta que intentas visitar no existe o fue movida. Revisa la URL o vuelve al inicio.
      </p>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button variant="primary" size="md" icon={<Home size={16} />}
          onClick={() => { void navigate(isAuthenticated ? "/dashboard" : "/"); }}>
          {isAuthenticated ? "Ir al Dashboard" : "Ir al inicio"}
        </Button>
        <Button variant="ghost" size="md" icon={<ArrowLeft size={16} />}
          onClick={() => { void navigate(-1); }}>
          Volver atrás
        </Button>
      </div>

      {/* Sugerencias */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">O visita una de estas páginas:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {(isAuthenticated
            ? [["Dashboard", "/dashboard"], ["Notas", "/notes"], ["Hábitos", "/habits"], ["Reportes", "/reports"]]
            : [["Inicio", "/"], ["Iniciar sesión", "/login"], ["Registrarse", "/register"]]
          ).map(([label, path]) => (
            <button key={path} onClick={() => { void navigate(path); }}
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-colors cursor-pointer">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
