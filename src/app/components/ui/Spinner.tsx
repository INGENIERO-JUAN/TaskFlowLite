/**
 * Spinner — Componente de carga reutilizable.
 *
 * Variantes: sm | md | lg
 * Colores: blue (default) | white | gray
 *
 * Uso:
 *   <Spinner />
 *   <Spinner size="lg" color="white" />
 *   <Spinner size="sm" label="Cargando tareas..." />
 */

import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white" | "gray";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-2",
  lg: "w-10 h-10 border-[3px]",
};

const colorClasses = {
  blue:  "border-blue-200 border-t-blue-600",
  white: "border-white/30 border-t-white",
  gray:  "border-gray-200 border-t-gray-500",
};

export function Spinner({ size = "md", color = "blue", label, className = "" }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-label={label ?? "Cargando..."}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}

/**
 * FullPageSpinner — Spinner centrado en toda la pantalla.
 * Ideal para estados de carga inicial.
 */
export function FullPageSpinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
      <Spinner size="lg" label={label} />
    </div>
  );
}
