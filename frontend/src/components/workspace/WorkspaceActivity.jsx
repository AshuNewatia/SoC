import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import Skeleton from '../common/Skeleton';
import {
  UserPlus,
  UserMinus,
  PlusCircle,
  PenSquare,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Clock,
  Settings,
  Link2,
  Unlink,
  CalendarClock,
  FileUp,
  Activity
} from "lucide-react";
import api from '../../services/api';

export default function WorkspaceActivity() {
  const { id } = useParams();
  const { socket } = useOutletContext();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/api/workspaces/${id}/activity`);
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    if (socket) {
      socket.on('activity_updated', fetchActivities);
    }

    return () => {
      if (socket) socket.off('activity_updated', fetchActivities);
    };
  }, [id, socket]);

  const filters = ['All', 'Tasks', 'Members', 'Admins'];

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'All') return activities;

    return activities.filter((activity) => {
      const type = activity.actionType || '';
      switch (activeFilter) {
        case 'Tasks':
          return type.startsWith('TASK_');
        case 'Members':
          return type.startsWith('MEMBER_');
        case 'Admins':
          return type === 'ADMIN_PROMOTED' || type === 'ADMIN_REMOVED';
        default:
          return true;
      }
    });
  }, [activities, activeFilter]);

  const groupedActivities = useMemo(() => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.createdAt);
      const dateKey = date.toDateString();

      let groupLabel;
      if (date.toDateString() === today.toDateString()) {
        groupLabel = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupLabel = 'Yesterday';
      } else {
        groupLabel = format(date, 'MMM d, yyyy');
      }

      if (!groups[groupLabel]) groups[groupLabel] = [];
      groups[groupLabel].push(activity);
    });

    const order = ['Today', 'Yesterday'];
    const sortedGroups = {};
    order.forEach((key) => {
      if (groups[key]) sortedGroups[key] = groups[key];
    });
    const otherKeys = Object.keys(groups)
      .filter((key) => !order.includes(key))
      .sort(
        (a, b) =>
          new Date(groups[b][0].createdAt) -
          new Date(groups[a][0].createdAt)
      );
    otherKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [filteredActivities]);

  const getActivityConfig = (actionType) => {
    switch (actionType) {
      case "ADMIN_PROMOTED":
        return { icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50" };
      case "ADMIN_REMOVED":
        return { icon: ShieldCheck, color: "text-gray-500", bg: "bg-gray-50" };
      case "GITHUB_LINKED":
        return { icon: Link2, color: "text-green-600", bg: "bg-green-50" };
      case "GITHUB_UNLINKED":
        return { icon: Unlink, color: "text-orange-500", bg: "bg-orange-50" };
      case "MEMBER_ADDED":
        return { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" };
      case "MEMBER_REMOVED":
        return { icon: UserMinus, color: "text-red-500", bg: "bg-red-50" };
      case "TASK_COMPLETED":
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
      case "TASK_CREATED":
        return { icon: PlusCircle, color: "text-green-500", bg: "bg-green-50" };
      case "TASK_DELETED":
        return { icon: Trash2, color: "text-red-400", bg: "bg-red-50" };
      case "TASK_UPDATED":
        return { icon: PenSquare, color: "text-amber-500", bg: "bg-amber-50" };
      case "WORKSPACE_CREATED":
        return { icon: PlusCircle, color: "text-cyan-500", bg: "bg-cyan-50" };
      case "WORKSPACE_UPDATED":
        return { icon: Settings, color: "text-indigo-500", bg: "bg-indigo-50" };
      case 'TASK_ASSIGNED':
        return { icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-50' };
      case 'TASK_DUE_DATE_CHANGED':
        return { icon: CalendarClock, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'FILE_UPLOADED':
        return { icon: FileUp, color: 'text-sky-500', bg: 'bg-sky-50' };
      default:
        return { icon: Clock, color: "text-gray-500", bg: "bg-gray-50" };
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getRelativeTime = (date) =>
    formatDistanceToNow(
      new Date(date),
      { addSuffix: true }
    );

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full bg-white border border-border-light rounded-3xl shadow-sm font-sans overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b border-border-light bg-white">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity size={18} className="text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-text-primary">Activity Log</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-green-50 text-emerald-700 border border-green-200 text-[10px] font-semibold whitespace-nowrap uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${activeFilter === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent border border-border-light text-text-secondary hover:bg-slate-50 hover:text-text-primary hover:-translate-y-0.5 hover:shadow-sm'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="max-h-[70vh] overflow-y-auto bg-white minimalist-scrollbar">
        {loading ? (
          <div className="p-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="relative flex gap-4 py-5"
              >
                {item !== 6 && (
                  <div className="absolute left-5 top-14 bottom-0 w-px bg-slate-300/60" />
                )}
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 flex-1 max-w-sm" />
                  </div>
                  <div className="flex gap-3 mt-3">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>))}
          </div>
        ) : Object.keys(groupedActivities).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[420px] px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Clock size={28} className="text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary">
              No Activity Yet
            </h3>
            <p className="text-text-secondary mt-3 max-w-md leading-relaxed">
              Workspace activity will appear here whenever members create,
              update, complete, assign tasks or make changes inside the
              workspace.
            </p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([groupLabel, items]) => (
            <div key={groupLabel}>
              {/* Group header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-2 border-b border-border-light text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {groupLabel}
              </div>

              {/* Timeline */}
              <div className="relative">
                {items.map((item, index) => {
                  const { icon: Icon, color, bg } = getActivityConfig(item.actionType);
                  const isLast = index === items.length - 1;
                  const exactTimestamp = new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  return (
                    <div 
                      key={item._id} 
                      className="relative flex gap-4 px-6 py-4 hover:bg-slate-50 hover:border-l-4 hover:border-primary transition-all duration-200"
                    >
                      {/* Vertical line (except last) */}
                      {!isLast && (
                        <div className="absolute left-9 top-12 bottom-0 w-0.5 bg-slate-300/60" />
                      )}

                      {/* Avatar + Icon */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm border-2 border-white shadow-sm hover:scale-105 transition-transform duration-200">
                          {getUserInitials(item.userId?.name)}
                        </div>

                        {/* Action icon badge */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${bg} border-2 border-white flex items-center justify-center shadow-md`}
                        >
                          <Icon size={12} className={color} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary leading-relaxed">
                          <span className="font-semibold text-primary">
                            {item.userId?.name || 'A user'}
                          </span>{' '}
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary font-medium flex-wrap">
                          <span>
                            {formatDateTime(item.createdAt)}
                          </span>
                          <span>•</span>
                          <span>
                            {getRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}