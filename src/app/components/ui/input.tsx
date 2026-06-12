/**
 * Input — Componente de campo de texto reutilizable con dark mode.
 *
 * Variantes: default | error | success
 * Props:     label, hint, error, leftIcon, rightIcon, fullWidth
 */
import React, { forwardRef } from "react";

type InputVariant = "default" | "error" | "success";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const baseInput =
  "peer w-full rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed";

const variantInput: Record<InputVariant, string> = {
  default:
    "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20",
  error:
    "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
  success:
    "border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-green-500/20",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    variant,
    leftIcon,
    rightIcon,
    fullWidth = true,
    className = "",
    id,
    ...rest
  },
  ref
) {
  const resolvedVariant: InputVariant = error ? "error" : (variant ?? "default");
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            baseInput,
            variantInput[resolvedVariant],
            leftIcon ? "pl-10" : "pl-3.5",
            rightIcon ? "pr-10" : "pr-3.5",
            "py-2.5",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 text-gray-400 dark:text-gray-500">
            {rightIcon}
          </span>
        )}
      </div>
      {(error ?? hint) && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
