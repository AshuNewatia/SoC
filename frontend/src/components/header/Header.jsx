import { Bell, Search, ChevronDown } from "lucide-react";

export default function Header({ title = "Overview" }) {
  return (
    <header className="h-18 bg-white/90 backdrop-blur-md shadow-sm px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="w-72 pl-10 pr-4 py-2.5 rounded-2xl bg-bg-light border border-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Notification */}
        <button className="relative p-3 rounded-2xl hover:bg-bg-light hover:shadow-sm transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 px-2.5 py-1.5 rounded-2xl hover:bg-bg-light hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-semibold">
            H
          </div>
          <p className="text-sm font-semibold text-text-primary">Harsh</p>
          <ChevronDown size={16} className="text-text-secondary" />
        </button>
      </div>
    </header>
  );
}