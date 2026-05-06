/**
 * Tooltip — Componente de información emergente reutilizable.
 *
 * Muestra un tooltip al hacer hover sobre el elemento hijo.
 * Posiciones: top | bottom | left | right
 */
import React, { useState } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: React.ReactNode;
  className?: string;
}

const positionClasses: Record<TooltipPosition, { tooltip: string; arrow: string }> = {
  top: {
    tooltip: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    arrow:   "top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700 border-x-transparent border-b-transparent border-4",
  },
  bottom: {
    tooltip: "top-full left-1/2 -translate-x-1/2 mt-2",
    arrow:   "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700 border-x-transparent border-t-transparent border-4",
  },
  left: {
    tooltip: "right-full top-1/2 -translate-y-1/2 mr-2",
    arrow:   "left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700 border-y-transparent border-r-transparent border-4",
  },
  right: {
    tooltip: "left-full top-1/2 -translate-y-1/2 ml-2",
    arrow:   "right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700 border-y-transparent border-l-transparent border-4",
  },
};

export function Tooltip({ content, position = "top", children, className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const pos = positionClasses[position];

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div className={`absolute z-50 ${pos.tooltip}`} role="tooltip">
          <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg max-w-xs">
            {content}
          </div>
          <span className={`absolute ${pos.arrow} w-0 h-0`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
