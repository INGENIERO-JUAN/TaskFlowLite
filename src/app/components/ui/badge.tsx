/**
 * Badge — Componente de etiqueta/distintivo reutilizable.
 *
 * Variantes: default | primary | success | warning | danger | info
 * Tamaños:   sm | md
 * Con punto de color opcional.
 */
import React from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  primary: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  success: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  warning: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
  danger:  "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
  info:    "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  primary: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger:  "bg-red-500",
  info:    "bg-purple-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
