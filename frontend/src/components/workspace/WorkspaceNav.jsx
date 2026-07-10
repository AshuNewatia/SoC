import { NavLink, useParams } from "react-router-dom";

const tabs = ["Overview", "Board", "Analytics", "Activity", "Members"];

export default function WorkspaceNav() {
  const { id } = useParams();

  const getTabClass = ({ isActive }) =>
    `px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-sm md:text-[15px] font-medium tracking-tight transition-all duration-200 whitespace-nowrap ${
      isActive
        ? "bg-primary text-white shadow-md"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1 shadow-sm sticky top-0 z-20 overflow-x-auto">
      {tabs.map((tab) => (
        <NavLink
          key={tab}
          to={`/workspace/${id}/${tab.toLowerCase()}`}
          className={getTabClass}
        >
          {tab}
        </NavLink>
      ))}
    </div>
  );
}