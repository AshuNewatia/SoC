// src/components/dashboard/StatCard.jsx
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({ stat }) {
  const Icon = stat.icon;
  const isUp = stat.trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer min-h-[170px] flex flex-col"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-hover" />

      {/* Icon container */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary"
      >
        <Icon size={20} className="text-primary md:text-[22px] transition-colors duration-300 group-hover:text-white" />
      </motion.div>

      {/* Value and Title */}
      <div className="text-2xl md:text-3xl font-bold tracking-tight mt-4 md:mt-5 text-text-primary">
        {stat.value}
      </div>
      <div className="text-sm md:text-base font-semibold text-text-primary mt-1">
        {stat.title}
      </div>

      {/* Footer with change info */}
      {stat.change && (
        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
          <div className={`flex items-center gap-1 ${isUp ? "text-emerald-600" : "text-text-secondary"}`}>
            {stat.trend && (
              isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            )}
            <span>{stat.change}</span>
          </div>
          <span className="text-text-secondary">{stat.changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}