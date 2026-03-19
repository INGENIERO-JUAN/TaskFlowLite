import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  border?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  border = true,
}: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm",
        border ? "border border-gray-100" : "",
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : "",
        paddingClasses[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  color?: "blue" | "yellow" | "green" | "red";
}

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", iconBg: "bg-yellow-100" },
  green: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" },
  red: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
};

export function KPICard({ title, value, icon, change, changeType = "neutral", color = "blue" }: KPICardProps) {
  const colors = colorMap[color];
  const changeColor =
    changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-500" : "text-gray-500";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`${colors.iconBg} ${colors.text} p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-3xl ${colors.text}`} style={{ fontWeight: 700 }}>
          {value}
        </p>
        {change && (
          <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
        )}
      </div>
    </div>
  );
}
