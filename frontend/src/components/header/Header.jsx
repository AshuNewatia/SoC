import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

export default function Header({ title = "Overview", onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate(); // 2. Initialize it
  
  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const month = today.toLocaleDateString("en-US", { month: "long" });
  const day = today.getDate();
  const year = today.getFullYear();
  const formattedDate = `${weekday}, ${month} ${day} ${year}`;

  return (
    <header className="h-16 md:h-18 bg-white/90 backdrop-blur-md shadow-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left Side: menu button + title + date */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-all"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">{title}</h1>
          <p className="text-xs text-gray-600 mt-0.5 hidden md:block">{formattedDate}</p>
        </div>
      </div>

      {/* Right Side: search, notification, profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative">
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all">
            <Search size={18} className="text-gray-600" />
          </button>
          <div className="hidden md:block relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search workspace..."
              className="w-64 lg:w-72 pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-200">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* 3. Attach navigate('/profile') to the profile button */}
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2 md:gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-br from-primary to-primary-hover flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <p className="text-sm font-semibold text-gray-800 hidden md:block">{user?.name || "User"}</p>
          <ChevronDown size={16} className="text-gray-500 hidden md:block" />
        </button>
      </div>
    </header>
  );
}