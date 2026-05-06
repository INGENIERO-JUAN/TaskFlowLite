/**
 * SkeletonCard — Componente de esqueleto animado para estados de carga.
 *
 * Variantes:
 *   - kpi:  Tarjeta KPI del dashboard (número + ícono)
 *   - task: Fila de tarea de la lista
 *   - text: Líneas de texto genéricas
 *
 * Uso:
 *   <SkeletonCard variant="kpi" />
 *   <SkeletonCard variant="task" />
 *   <SkeletonCard variant="text" lines={3} />
 */

import React from "react";

interface SkeletonCardProps {
  variant?: "kpi" | "task" | "text";
  lines?: number;
  className?: string;
}

/** Bloque base animado */
function Bone({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
  );
}

export function SkeletonCard({ variant = "text", lines = 2, className = "" }: SkeletonCardProps) {
  if (variant === "kpi") {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <Bone className="h-3 w-24" />
          <Bone className="h-8 w-8 rounded-lg" />
        </div>
        <Bone className="h-8 w-16 mb-2" />
        <Bone className="h-3 w-28" />
      </div>
    );
  }

  if (variant === "task") {
    return (
      <div className={`px-6 py-4 flex items-center gap-4 ${className}`}>
        <Bone className="h-5 w-5 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Bone className="h-3.5 w-3/4" />
          <Bone className="h-3 w-1/2" />
        </div>
        <Bone className="h-5 w-16 rounded-full" />
        <Bone className="h-5 w-14 rounded-full" />
        <Bone className="h-7 w-7 rounded-lg" />
      </div>
    );
  }

  // text (default)
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} className={`h-3 ${i === lines - 1 ? "w-3/5" : "w-full"}`} />
      ))}
    </div>
  );
}

/**
 * SkeletonDashboard — Skeleton completo del dashboard durante carga inicial.
 */
export function SkeletonDashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[1, 2, 3].map(i => (
          <SkeletonCard key={i} variant="kpi" />
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5" />
      </div>

      {/* Task list */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="h-9 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
            <SkeletonCard variant="task" />
          </div>
        ))}
      </div>
    </main>
  );
}
