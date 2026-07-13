import React from "react";

export default function KPIStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const colors = {
    blue: {
      border: "hover:border-blue-300",
      line: "bg-blue-500",
      icon: "text-blue-500",
      bg: "bg-blue-50",
    },
    green: {
      border: "hover:border-green-300",
      line: "bg-green-500",
      icon: "text-green-500",
      bg: "bg-green-50",
    },
    orange: {
      border: "hover:border-orange-300",
      line: "bg-orange-500",
      icon: "text-orange-500",
      bg: "bg-orange-50",
    },
    red: {
      border: "hover:border-red-300",
      line: "bg-red-500",
      icon: "text-red-500",
      bg: "bg-red-50",
    },
  };

  const style = colors[color];

  return (
    <div
      className={`group rounded-2xl border border-border-light bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.border}`}
    >
      {/* Top Accent */}
      <div
        className={`h-1 w-12 rounded-full ${style.line} mb-5 transition-all duration-300 group-hover:w-20`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-text-primary">
            {value}
          </h2>

          <p className="mt-2 text-xs text-text-secondary">
            {subtitle}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center`}
        >
          {Icon && (
  <Icon
    size={20}
    className={`${style.icon} transition-transform duration-300 group-hover:scale-110`}
  />
)}
        </div>
      </div>
    </div>
  );
}