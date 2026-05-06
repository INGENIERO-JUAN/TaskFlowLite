/**
 * Card — Componentes de tarjeta reutilizables con dark mode.
 *
 * Exports:
 *   Card      — Contenedor genérico con variantes de padding y sombra
 *   CardHeader — Encabezado de tarjeta con título/subtítulo y acción
 *   KPICard   — Tarjeta de indicador clave de rendimiento para el Dashboard
 */
import React from "react";

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md";
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
};

export function Card({
  children,
  className = "",
  padding = "md",
  shadow = "sm",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl",
        paddingClasses[padding],
        shadowClasses[shadow],
        hover || onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          : "transition-shadow",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

// ─── CardHeader ───────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── KPICard ──────────────────────────────────────────────────────────────────

type KPIColor = "blue" | "green" | "yellow" | "red" | "purple" | "gray";
type KPIChangeType = "up" | "down" | "neutral";

interface KPICardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: KPIColor;
  change?: string;
  changeType?: KPIChangeType;
  className?: string;
}

const kpiColorClasses: Record<KPIColor, { icon: string; value: string }> = {
  blue:   { icon: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",     value: "text-blue-600 dark:text-blue-400"   },
  green:  { icon: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400", value: "text-green-600 dark:text-green-400" },
  yellow: { icon: "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400", value: "text-yellow-600 dark:text-yellow-400" },
  red:    { icon: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",         value: "text-red-600 dark:text-red-400"     },
  purple: { icon: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400", value: "text-purple-600 dark:text-purple-400" },
  gray:   { icon: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",     value: "text-gray-900 dark:text-white"      },
};

const changeTypeClasses: Record<KPIChangeType, string> = {
  up:      "text-green-600 dark:text-green-400",
  down:    "text-red-500 dark:text-red-400",
  neutral: "text-gray-500 dark:text-gray-400",
};

export function KPICard({
  title,
  value,
  icon,
  color = "blue",
  change,
  changeType = "neutral",
  className = "",
}: KPICardProps) {
  const colors = kpiColorClasses[color];

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold mb-1 ${colors.value}`}>{value}</p>
      {change && (
        <p className={`text-xs font-medium ${changeTypeClasses[changeType]}`}>{change}</p>
      )}
    </div>
  );
}
