/**
 * Button — Componente de botón reutilizable con variantes y estados.
 *
 * Variantes: primary | secondary | danger | ghost | outline
 * Tamaños:   sm | md | lg
 * Props:     icon, loading, disabled, fullWidth
 */
import React from "react";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-transparent shadow-sm disabled:bg-blue-300",
  secondary:
    "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 text-gray-700 dark:text-gray-200 border-transparent",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent shadow-sm disabled:bg-red-300",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent",
  outline:
    "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 active:bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-base gap-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium border transition-colors cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <Spinner
          size="sm"
          color={variant === "primary" || variant === "danger" ? "white" : "gray"}
        />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0 ml-auto">{iconRight}</span>}
    </button>
  );
}
