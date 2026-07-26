import { useState, useEffect, useRef } from "react";
import { Clock, Bell, Check, Trash2, Circle, MessageSquare, AtSign, UserPlus, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed marking notifications as read", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead && notif._id) {
      try {
        await api.put(`/api/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed marking notification as read", err);
      }
    }

    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const handleClearActivityLog = () => {
    setNotifications([]);
  };

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "DEADLINE_REMINDER":
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-base shadow-xs">
            <Clock size={16} />
          </div>
        );
      case "mention":
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base shadow-xs">
            <AtSign size={16} />
          </div>
        );
      case "OWNERSHIP_TRANSFERRED":
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base shadow-xs">
            👑
          </div>
        );
      case "TASK_ASSIGNED":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base shadow-xs">
            <UserPlus size={16} />
          </div>
        );
      case "TASK_EDITED":
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shadow-xs">
            <Edit3 size={16} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <MessageSquare size={16} />
          </div>
        );
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer focus:outline-hidden"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-88 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 italic tracking-wide">
                Updates Feed
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {unreadCount} unread alert{unreadCount !== 1 && "s"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <Check size={14} /> Read all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-3">
                  <Bell size={24} className="opacity-60" />
                </div>
                <p className="text-sm font-medium text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-400 max-w-50 mt-1 font-sans">
                  When teammates update project tasks or tag you, alerts sync live here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || Math.random()}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex gap-3 hover:bg-slate-50 transition relative group cursor-pointer ${
                    !notif.isRead ? "bg-blue-50/20" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {renderNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1 pr-4 font-sans">
                    <p
                      className={`text-xs leading-relaxed wrap-break-word ${
                        !notif.isRead ? "text-slate-900 font-medium" : "text-slate-600"
                      }`}
                    >
                      {notif.message}
                    </p>

                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="absolute right-4 top-5">
                      <Circle size={6} className="fill-blue-600 text-blue-600" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50/30 border-t border-slate-100 text-center">
              <button
                onClick={handleClearActivityLog}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer"
              >
                <Trash2 size={13} /> Clear activity log
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}