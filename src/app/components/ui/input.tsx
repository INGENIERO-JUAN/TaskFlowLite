import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-gray-400 flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 hover:border-gray-400",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-gray-400 flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
