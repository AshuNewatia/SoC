// src/components/dashboard/StatCard.jsx
export default function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer aspect-square md:aspect-auto flex flex-col justify-center">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

      {/* Icon container */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon size={18} className="text-primary md:text-[22px]" />
      </div>

      <div className="text-2xl md:text-3xl font-bold tracking-tight mt-4 md:mt-5">
        {stat.value}
      </div>
      <div className="text-base md:text-lg font-semibold text-text-primary mt-1 md:mt-2">
        {stat.title}
      </div>
      <div className="text-xs md:text-sm text-text-secondary mt-0.5 md:mt-1">
        {stat.subtitle}
      </div>
    </div>
  );
}