import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { User, GraduationCap, Settings } from "lucide-react";

export default function ProfilePopover({ isOpen, onClose }) {
  const { user } = useAuth();
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Handle auto-closing the dialog box when clicking anywhere else on the page
  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden `z-[100]` animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Dynamic Profile Header Summary */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-semibold text-slate-800 text-sm truncate">{user?.name}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
            {user?.role || "Member"}
          </p>
        </div>
      </div>

      {/* Focused Academic Details Grid */}
      <div className="p-3.5 space-y-2.5 bg-white border-b border-slate-100">
        <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50/60 border border-slate-100/80">
          <User size={15} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="overflow-hidden">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
            <span className="text-xs text-slate-700 font-medium truncate block">{user?.name}</span>
          </div>
        </div>

        {user?.role === "student" && (
          <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50/60 border border-slate-100/80">
            <GraduationCap size={15} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Timeline</span>
              <span className="text-xs text-slate-700 font-medium block">
                {user?.year ? `${user.year} Year` : "N/A"} • {user?.branch || "General"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Redirect Links Bar */}
      <div className="p-1.5 bg-white space-y-0.5">
        <button
          onClick={() => {
            navigate("/settings"); // Routes directly to the sidebar settings template layout
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
        >
          <Settings size={14} className="text-slate-400" />
          Edit Profile Settings
        </button>
      </div>
    </div>
  );
}