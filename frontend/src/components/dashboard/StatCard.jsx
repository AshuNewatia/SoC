// src/components/dashboard/StatCard.jsx
export default function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="
      relative
      overflow-hidden
      bg-white
      rounded-2xl
      p-5
      border
      border-slate-200
      shadow-sm
      hover:shadow-lg
      hover:-translate-y-1
      transition-all
      duration-300
      cursor-pointer
    ">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

      {/* Icon container */}
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon size={22} className="text-primary" />
      </div>

      <div className="text-3xl font-bold tracking-tight mt-5">
        {stat.value}
      </div>
      <div className="text-lg font-semibold text-text-primary mt-2">
        {stat.title}
      </div>
      <div className="text-sm text-text-secondary mt-1">
        {stat.subtitle}
      </div>
    </div>
  );
}