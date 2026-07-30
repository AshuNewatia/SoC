// src/components/workspace/WorkspaceNav.jsx
import { NavLink, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  BarChart3, 
  Activity, 
  Users,
  GitBranch
} from "lucide-react";

const tabs = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Board", icon: KanbanSquare },
  { name: "Analytics", icon: BarChart3 },
  { name: "Activity", icon: Activity },
  { name: "Members", icon: Users },
];

export default function WorkspaceNav() {
  const { id } = useParams();

  const getTabClass = ({ isActive }) =>
    `relative px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-sm md:text-[15px] font-medium tracking-tight transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 md:gap-2 ${
      isActive
        ? "text-white"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-sm"
    }`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1 shadow-sm sticky top-0 z-20 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={`/workspace/${id}/${tab.name.toLowerCase()}`}
          className={getTabClass}
        >
          {({ isActive }) => (
            <>
              <tab.icon size={16} className="shrink-0" />
              <span>{tab.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}