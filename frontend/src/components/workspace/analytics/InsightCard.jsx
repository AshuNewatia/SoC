import React from "react";
import { TrendingUp } from "lucide-react";

export default function InsightCard({
  title,
  value,
  description,
  icon: Icon = TrendingUp,
  trend,
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-5 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-text-primary mt-2">
    {value || "--"}
</h3>
        </div>

        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon
            size={20}
            className="text-primary"
          />
        </div>
      </div>

      {description && (
        <p className="text-sm text-text-secondary mt-4 leading-relaxed">
    {description || "No insights available yet."}
</p>
      )}

      {trend && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
  );
}