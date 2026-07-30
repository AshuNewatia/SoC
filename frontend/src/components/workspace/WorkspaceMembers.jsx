import { useState, useEffect, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { handleApiError, handleSuccess } from '../../utils/handleApiError';
import Skeleton from '../common/Skeleton';
import {
  MoreVertical,
  Shield,
  User,
  UserMinus,
  UserPlus,
  X,
  Search,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
} from 'lucide-react';
import api from '../../services/api';

export default function WorkspaceMembers() {
  const { id } = useParams();
  const { socket } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMembers();

    if (socket) {
      socket.on('members_updated', fetchMembers);
    }

    return () => {
      if (socket) {
        socket.off('members_updated', fetchMembers);
      }
    };
  }, [id, socket, fetchMembers]);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);

    try {
      await api.post(`/api/workspaces/${id}/members`, { email: inviteEmail });

      handleSuccess("Invitation sent! The recipient should receive an email shortly.");

      setInviteEmail('');
      setInviteUrl('');
      setInviteOpen(false);

      await fetchMembers();
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setInviteLoading(false);
    }
  };

  const generateInviteLink = async () => {
    setUrlLoading(true);
    try {
      const response = await api.get(`/api/workspaces/${id}/invite-token`);
      if (response.data.success) {
        const cleanUrl = `${window.location.origin}/join/workspace/${response.data.inviteToken}`;
        setInviteUrl(cleanUrl);
      }
    } catch (err) {
      console.error("Could not fetch workspace invite token:", err);
      handleApiError(err);
    } finally {
      setUrlLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromote = async (memberId) => {
    try {
      await api.post(`/api/workspaces/${id}/admins/${memberId}`);
      await fetchMembers();
      handleSuccess("Promoted to admin successfully");
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const handleDemote = async (memberId) => {
    try {
      await api.delete(`/api/workspaces/${id}/admins/${memberId}`);
      await fetchMembers();
      handleSuccess("Demoted to member successfully");
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/api/workspaces/${id}/members/${memberId}`);
      await fetchMembers();
      handleSuccess("Member removed successfully");
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="w-full bg-white border border-border-light rounded-3xl shadow-sm font-sans overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-light">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={22} />
          <h2 className="text-xl font-bold text-text-primary">Workspace Members</h2>
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-xs font-bold">
            {members.length}
          </span>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
        >
          <UserPlus size={18} />
          Invite
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border-light bg-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-border-light rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="w-9 h-9 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-90 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Users size={28} className="text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary">No Members Found</h3>
            <p className="text-text-secondary mt-3 max-w-md leading-relaxed">
              {searchQuery
                ? "No workspace members match your search."
                : "Invite teammates to collaborate on tasks, manage projects and work together in this workspace."}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 hover:border-l-4 hover:border-primary transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full font-bold flex items-center justify-center text-lg bg-gradient-to-br from-primary to-primary-hover text-white shadow-sm hover:scale-105 transition-transform duration-200">
                  {getInitials(member.name)}
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary text-base">
                    {member.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${getRoleStyle(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.role !== 'Owner' && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === member._id ? null : member._id);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-all duration-200 hover:rotate-90"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === member._id && (
                      <div
                        className="absolute right-0 top-10 bg-white border border-border-light rounded-xl shadow-lg min-w-45 z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.role === 'Member' && (
                          <button
                            onClick={() => handlePromote(member._id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-primary/5 text-left text-sm transition-colors duration-200"
                          >
                            <Shield size={16} className="text-blue-600" />
                            Promote to Admin
                          </button>
                        )}
                        {member.role === 'Admin' && (
                          <button
                            onClick={() => handleDemote(member._id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-primary/5 text-left text-sm transition-colors duration-200"
                          >
                            <User size={16} className="text-slate-600" />
                            Demote to Member
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member._id)}
                          className="w-full px-4 py-3 flex items-center gap-2 hover:bg-red-50 text-red-500 text-left text-sm border-t border-border-light transition-colors duration-200"
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
      <AnimatePresence>
        {inviteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setInviteOpen(false);
                setInviteUrl('');
              }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mx-4 sm:mx-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-primary">Invite Member</h3>
                  <button
                    onClick={() => {
                      setInviteOpen(false);
                      setInviteUrl('');
                    }}
                    className="p-1 rounded hover:bg-slate-100 transition-all duration-200 hover:rotate-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Email Option */}
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Invite via Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-border-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/30 transition-all duration-200"
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    disabled={inviteLoading}
                    onClick={() => {
                      setInviteOpen(false);
                      setInviteUrl('');
                    }}
                    className="px-4 py-2 rounded-lg border border-border-light text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? "Sending Invitation..." : "Invite via Email"}
                  </button>
                </div>

                {/* OR Divider & URL Link Generation */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-light" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-text-secondary font-semibold">Or</span></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-border-light space-y-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-primary" />
                    <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Invite via Secret URL Link</h4>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Anyone with this link can join the workspace directly. Share it only with people you trust.
                  </p>

                  {!inviteUrl ? (
                    <button
                      onClick={generateInviteLink}
                      disabled={urlLoading}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                    >
                      {urlLoading ? "Generating Token..." : "Generate Invite Link"}
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        readOnly
                        value={inviteUrl}
                        className="w-full text-xs px-3 py-2 border border-border-light bg-white rounded-lg outline-none text-text-primary select-all"
                      />
                      <motion.button
                        onClick={copyToClipboard}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg border transition-all duration-200 shrink-0 ${copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-text-secondary border-border-light hover:bg-slate-50'
                          }`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}