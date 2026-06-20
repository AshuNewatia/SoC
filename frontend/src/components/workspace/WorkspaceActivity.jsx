import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import api from '../../services/api'; // ✅ adjust path

export default function WorkspaceActivity() {
  const { id } = useParams();
  const { socket } = useOutletContext(); 
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
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

    fetchActivities();

    if (socket) {
      socket.on("new_activity", (newActivity) => {
        setActivities((prev) => [newActivity, ...prev]);
      });
    }

    return () => {
      if (socket) socket.off("new_activity");
    };
  }, [id, socket]);

  // Filters and helpers unchanged
  const filters = ['All', 'Tasks', 'Members', 'Files'];

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'MEMBER_ADDED': return '👤+';
      case 'TASK_CREATED': return '📅';
      case 'TASK_UPDATED': return '✏️';
      case 'TASK_COMPLETED': return '✓';
      default: return '⚡';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-surface border border-border-light rounded-[var(--radius-xl)] shadow-sm overflow-hidden font-sans text-text-primary">
      <div className="flex items-center justify-between p-5 border-b border-border-light bg-surface">
        <div className="flex items-center gap-4">
          <div className="text-primary text-xl font-bold">≡</div>
          <h2 className="text-xl font-semibold text-text-primary">Activity Log</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-success border border-green-200 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> LIVE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeFilter === filter 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-transparent border border-border-light text-text-secondary hover:bg-bg-light hover:text-text-primary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-border-light bg-surface max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading live activity...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No recent activity found.</div>
        ) : (
          activities.map((item) => (
            <div key={item._id} className="flex gap-4 p-5 hover:bg-bg-light transition-colors">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-bg-light border border-border-light flex items-center justify-center text-text-secondary shadow-sm">
                {getActionIcon(item.actionType)}
              </div>
              <div className="flex flex-col flex-grow justify-center">
                <p className="text-sm text-text-primary leading-relaxed">
                  <span className="text-primary font-semibold">{item.userId?.name || 'A user'}</span>{' '}
                  {item.description}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary font-medium">
                  <span className="flex items-center gap-1">⏱ {formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
