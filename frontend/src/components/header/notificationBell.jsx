import { useState, useEffect, useRef } from "react";
import { Clock, Bell, Check, Trash2, Circle, MessageSquare, AtSign, UserPlus, Edit3, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import socket from "../../services/socket";
import { handleApiError, handleSuccess } from "../../utils/handleApiError";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
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

  // Count invitations
  const invitationCount = notifications.filter(
    (n) => n.type === "WORKSPACE_INVITATION"
  ).length;

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "invitations":
        return notifications.filter((n) => n.type === "WORKSPACE_INVITATION");
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

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

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAcceptInvitation = async (notification) => {
    try {
      const res = await api.post(`/api/workspaces/workspace-invitations/${notification.relatedId}/accept`);
      
      handleSuccess("✓ Successfully joined the workspace.");
      
      // Animate removal
      const notifElement = document.getElementById(`notif-${notification._id}`);
      if (notifElement) {
        notifElement.style.opacity = "0";
        notifElement.style.transform = "scale(0.95)";
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
        }, 300);
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
      }
      
      setIsOpen(false);
      
      // Navigate to workspace after accepting
      if (res.data?.workspace?.id) {
        navigate(`/workspace/${res.data.workspace.id}`);
      } else if (notification.workspace) {
        navigate(`/workspace/${notification.workspace}`);
      }
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      handleApiError(err);
    }
  };

  const handleDeclineInvitation = async (notification) => {
    try {
      await api.post(`/api/workspaces/workspace-invitations/${notification.relatedId}/decline`);
      
      handleSuccess("Invitation declined.");
      
      // Animate removal
      const notifElement = document.getElementById(`notif-${notification._id}`);
      if (notifElement) {
        notifElement.style.opacity = "0";
        notifElement.style.transform = "scale(0.95)";
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
        }, 300);
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
      }
      
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to decline invitation:", err);
      handleApiError(err);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
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
      case "WORKSPACE_INVITATION":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Users size={17} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
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
          <motion.span
            key={unreadCount}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
            className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white shadow-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 italic tracking-wide">
                  Notifications
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {unreadCount} unread
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

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/30 px-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 relative ${
                  activeTab === "all"
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All
                {notifications.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px]">
                    {notifications.length}
                  </span>
                )}
                {activeTab === "all" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 relative ${
                  activeTab === "unread"
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px]">
                    {unreadCount}
                  </span>
                )}
                {activeTab === "unread" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("invitations")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 relative ${
                  activeTab === "invitations"
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Invitations
                {invitationCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px]">
                    {invitationCount}
                  </span>
                )}
                {activeTab === "invitations" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 px-4 flex flex-col items-center justify-center text-center"
                  >
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-3 text-4xl">
                      🎉
                    </div>
                    <p className="text-sm font-medium text-slate-800">All caught up!</p>
                    <p className="text-xs text-slate-400 max-w-50 mt-1 font-sans">
                      {activeTab === "invitations" 
                        ? "No pending invitations" 
                        : activeTab === "unread"
                        ? "No unread notifications"
                        : "When teammates update project tasks or tag you, alerts sync live here."}
                    </p>
                  </motion.div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const isInvitation = notif.type === "WORKSPACE_INVITATION";
                    
                    return (
                      <motion.div
                        id={`notif-${notif._id}`}
                        key={notif._id || Math.random()}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          if (!isInvitation) handleNotificationClick(notif);
                        }}
                        className={`p-4 rounded-xl transition-all duration-300 relative cursor-pointer ${
                          isInvitation
                            ? "bg-emerald-50/60 border-l-4 border-emerald-500 hover:bg-emerald-50/80 hover:shadow-sm"
                            : `hover:bg-slate-50 hover:shadow-sm hover:border-slate-200 ${
                              !notif.isRead ? "bg-blue-50/30" : ""
                            }`
                        }`}
                      >
                        {/* Icon */}
                        <div className="shrink-0 mt-0.5">{renderNotificationIcon(notif.type)}</div>

                        {/* Content */}
                        <div className="flex-1 space-y-1 pr-4 font-sans">
                          {/* Workspace Invitation Badge */}
                          {isInvitation && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 mb-1">
                              Workspace Invitation
                            </span>
                          )}

                          <p
                            className={`text-xs leading-relaxed wrap-break-word ${
                              !notif.isRead ? "text-slate-900 font-medium" : "text-slate-600"
                            }`}
                          >
                            {notif.message}
                          </p>

                          {/* Accept/Decline buttons for workspace invitations */}
                          {isInvitation && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptInvitation(notif);
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                              >
                                ✓ Join Workspace
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeclineInvitation(notif);
                                }}
                                className="flex-1 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          <span className="text-[10px] text-slate-400 block mt-1">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && (
                          <div className="absolute right-4 top-5">
                            <Circle size={6} className="fill-blue-600 text-blue-600" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 bg-slate-50/30 border-t border-slate-100 text-center">
                <button
                  onClick={handleClearNotifications}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer hover:translate-x-1"
                >
                  <Trash2 size={13} /> Clear notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}