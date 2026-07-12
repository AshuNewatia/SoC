import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed fetching notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    socket.on("newNotification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => socket.off("newNotification");
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClearNotifications = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen) handleClearNotifications(); }}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 font-semibold text-sm text-slate-800 flex justify-between items-center">
            <span>Notifications</span>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">All caught up!</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className={`p-4 text-sm transition ${!notif.isRead ? "bg-blue-50/40 font-medium" : "text-slate-600"}`}>
                  <p className="text-slate-800">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}