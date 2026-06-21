import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import {
  MoreVertical,
  Shield,
  User,
  UserMinus,
  UserPlus,
  Mail,
  X,
  Search,
  Users,
} from 'lucide-react';
import api from '../../services/api';

export default function WorkspaceMembers() {
  const { id } = useParams(); // ✅ moved inside component
  const { socket } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Dropdown menu state
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/api/workspaces/${id}/members`);
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    if (socket) {
      socket.on('member_added', (newMember) => {
        setMembers((prev) => [...prev, newMember]);
      });
      socket.on('member_removed', (removedUserId) => {
        setMembers((prev) => prev.filter((m) => m._id !== removedUserId));
      });
      socket.on('role_updated', (updatedMember) => {
        setMembers((prev) =>
          prev.map((m) => (m._id === updatedMember._id ? updatedMember : m))
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('member_added');
        socket.off('member_removed');
        socket.off('role_updated');
      }
    };
  }, [id, socket]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleInvite = async () => {
    try {
      await api.post(`/api/workspaces/${id}/members`, { email: inviteEmail });
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      setInviteEmail('');
      setInviteOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to invite member');
    }
  };

  const handlePromote = async (memberId) => {
    try {
      await api.put(`/api/workspaces/${id}/members/${memberId}/role`, { role: 'Admin' });
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to promote member');
    }
  };

  const handleDemote = async (memberId) => {
    try {
      await api.put(`/api/workspaces/${id}/members/${memberId}/role`, { role: 'Member' });
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to demote member');
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/api/workspaces/${id}/members/${memberId}`);
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Filter
  const filteredMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Role badge styles
  const getRoleStyle = (role) => {
    if (role === 'Owner')
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (role === 'Admin')
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Users className="text-indigo-500" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Workspace Members</h2>
          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg text-xs font-bold">
            {members.length}
          </span>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <UserPlus size={18} />
          Invite
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No members found.</div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full font-bold flex items-center justify-center text-lg bg-indigo-600 text-white shadow-sm">
                  {getInitials(member.name)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base">
                    {member.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getRoleStyle(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Email icon – always visible */}
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  onClick={() => alert(`Email to ${member.email}`)} // or integrate with your mailto
                >
                  <Mail size={18} />
                </button>

                {/* Three-dot menu – only for non-owners */}
                {member.role !== 'Owner' && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === member._id ? null : member._id)
                      }
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === member._id && (
                      <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg min-w-[180px] z-50 overflow-hidden">
                        {member.role === 'Member' && (
                          <button
                            onClick={() => handlePromote(member._id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-50 text-left text-sm"
                          >
                            <Shield size={16} className="text-blue-600" />
                            Promote to Admin
                          </button>
                        )}
                        {member.role === 'Admin' && (
                          <button
                            onClick={() => handleDemote(member._id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-50 text-left text-sm"
                          >
                            <User size={16} className="text-slate-600" />
                            Demote to Member
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member._id)}
                          className="w-full px-4 py-3 flex items-center gap-2 hover:bg-red-50 text-red-500 text-left text-sm border-t border-slate-100"
                        >
                          <UserMinus size={16} />
                          Remove Member
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Invite Member
              </h3>
              <button
                onClick={() => setInviteOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}